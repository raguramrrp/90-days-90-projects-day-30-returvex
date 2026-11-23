import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

from app.core.database import SessionLocal, engine
from app.models.entities import (
    Order, OrderItem, Product, Category, Customer, Return,
    ModelVersion, Prediction
)

def train_and_evaluate_models():
    print("Extracting features from database with ZERO target leakage...")
    db = SessionLocal()
    
    # Fetch all orders ordered chronologically
    orders = db.query(Order).order_by(Order.order_date.asc()).all()
    
    records = []
    # Running customer history tracking to prevent future leakage
    cust_prior_orders = {}
    cust_prior_returns = {}
    
    # Pre-fetch returns map: order_id -> is_returned
    return_order_ids = {r.order_id for r in db.query(Return.order_id).all()}

    for ord in orders:
        c_id = ord.customer_id
        prior_o = cust_prior_orders.get(c_id, 0)
        prior_r = cust_prior_returns.get(c_id, 0)
        prior_ret_rate = (prior_r / prior_o) if prior_o > 0 else 0.0

        # Primary order item
        item = ord.items[0] if ord.items else None
        if not item:
            continue
            
        prod = item.product
        cat = prod.category
        cust = ord.customer
        
        is_ret = 1 if ord.id in return_order_ids else 0
        
        # Estimate delivery days (at order time)
        is_remote = ord.shipping_state in ["Assam", "Bihar", "Odisha", "Jammu & Kashmir"]
        est_days = 6 if is_remote else 3

        records.append({
            "order_id": ord.id,
            "order_number": ord.order_number,
            "category_name": cat.category_name,
            "selling_price": float(prod.selling_price),
            "discount_amount": float(item.discount_amount),
            "customer_order_count": prior_o + 1,
            "customer_prior_return_rate": float(prior_ret_rate),
            "estimated_delivery_days": est_days,
            "shipping_state": ord.shipping_state,
            "order_quantity": int(item.quantity),
            "payment_method": ord.payment_method,
            "is_returned": is_ret
        })

        # Update customer running stats for future orders
        cust_prior_orders[c_id] = prior_o + 1
        if is_ret:
            cust_prior_returns[c_id] = prior_r + 1

    df = pd.DataFrame(records)
    print(f"Total dataset records: {len(df)}")
    print(f"Class distribution: Not Returned (0) = {(df['is_returned'] == 0).sum()}, Returned (1) = {(df['is_returned'] == 1).sum()} ({(df['is_returned'] == 1).mean()*100:.2f}%)")

    categorical_features = ["category_name", "shipping_state", "payment_method"]
    numeric_features = [
        "selling_price", "discount_amount", "customer_order_count",
        "customer_prior_return_rate", "estimated_delivery_days", "order_quantity"
    ]
    feature_cols = categorical_features + numeric_features

    X = df[feature_cols]
    y = df["is_returned"]

    # Stratified Train/Test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train set: {len(X_train)}, Test set: {len(X_test)}")

    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    # 1. Baseline Model: Logistic Regression
    pipe_lr = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42))
    ])
    pipe_lr.fit(X_train, y_train)
    y_pred_lr = pipe_lr.predict(X_test)
    y_prob_lr = pipe_lr.predict_proba(X_test)[:, 1]

    metrics_lr = {
        "accuracy": float(accuracy_score(y_test, y_pred_lr)),
        "precision": float(precision_score(y_test, y_pred_lr, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_lr, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred_lr, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob_lr))
    }
    print(f"Logistic Regression -> F1: {metrics_lr['f1_score']:.4f}, ROC-AUC: {metrics_lr['roc_auc']:.4f}, Recall: {metrics_lr['recall']:.4f}")

    # 2. Advanced Model: Random Forest Classifier
    pipe_rf = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=150,
            max_depth=9,
            min_samples_split=8,
            class_weight="balanced",
            random_state=42
        ))
    ])
    pipe_rf.fit(X_train, y_train)
    y_pred_rf = pipe_rf.predict(X_test)
    y_prob_rf = pipe_rf.predict_proba(X_test)[:, 1]

    metrics_rf = {
        "accuracy": float(accuracy_score(y_test, y_pred_rf)),
        "precision": float(precision_score(y_test, y_pred_rf, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_rf, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred_rf, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob_rf))
    }
    print(f"Random Forest       -> F1: {metrics_rf['f1_score']:.4f}, ROC-AUC: {metrics_rf['roc_auc']:.4f}, Recall: {metrics_rf['recall']:.4f}")

    # Model selection based on F1-score & ROC-AUC
    if metrics_rf["f1_score"] >= metrics_lr["f1_score"]:
        best_name = "Random Forest Classifier"
        best_algo = "RandomForestClassifier"
        best_pipe = pipe_rf
        best_metrics = metrics_rf
        best_preds = y_pred_rf
        best_probs = y_prob_rf
    else:
        best_name = "Logistic Regression"
        best_algo = "LogisticRegression"
        best_pipe = pipe_lr
        best_metrics = metrics_lr
        best_preds = y_pred_lr
        best_probs = y_prob_lr

    print(f"Selected Champion Model: {best_name}")

    cm = confusion_matrix(y_test, best_preds)
    cm_dict = {
        "true_negatives": int(cm[0, 0]),
        "false_positives": int(cm[0, 1]),
        "false_negatives": int(cm[1, 0]),
        "true_positives": int(cm[1, 1])
    }
    cr_dict = classification_report(y_test, best_preds, output_dict=True)

    # Feature Importance extraction
    if best_algo == "RandomForestClassifier":
        rf_step = best_pipe.named_steps["classifier"]
        prep_step = best_pipe.named_steps["preprocessor"]
        cat_names = prep_step.named_transformers_["cat"].get_feature_names_out(categorical_features)
        all_feature_names = list(numeric_features) + list(cat_names)
        importances = rf_step.feature_importances_
        feat_imp = [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:15]
        ]
    else:
        feat_imp = []

    # Save artifact
    models_dir = backend_dir / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    model_path = models_dir / "returvex_model.joblib"
    joblib.dump(best_pipe, model_path)
    print(f"Saved model pipeline to {model_path}")

    model_version = "v1.0.0"
    metrics_payload = {
        "model_name": best_name,
        "version": model_version,
        "algorithm": best_algo,
        "training_date": datetime.utcnow().isoformat(),
        "accuracy": best_metrics["accuracy"],
        "precision": best_metrics["precision"],
        "recall": best_metrics["recall"],
        "f1_score": best_metrics["f1_score"],
        "roc_auc": best_metrics["roc_auc"],
        "confusion_matrix": cm_dict,
        "classification_report": cr_dict,
        "feature_importances": feat_imp,
        "class_distribution": {
            "total_orders": len(df),
            "not_returned_count": int((df["is_returned"] == 0).sum()),
            "returned_count": int((df["is_returned"] == 1).sum()),
            "return_rate_pct": round(float((df["is_returned"] == 1).mean() * 100), 2)
        },
        "comparison": {
            "logistic_regression": metrics_lr,
            "random_forest": metrics_rf
        },
        "notes": "Trained on zero-leakage chronological features: customer historical order count, customer prior return rate, item price, promotional discount, estimated shipping transit delay, shipping state, payment method, category."
    }

    with open(models_dir / "model_metrics.json", "w") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"Saved model metrics to {models_dir / 'model_metrics.json'}")

    # Register in database model_versions
    db.query(ModelVersion).filter(ModelVersion.version == model_version).delete()
    mv = ModelVersion(
        model_name=best_name,
        version=model_version,
        algorithm=best_algo,
        training_date=datetime.utcnow(),
        evaluation_metrics=json.dumps(metrics_payload),
        artifact_path=str(model_path).replace("\\", "/")
    )
    db.add(mv)
    db.commit()

    # Pre-populate prediction records on a recent batch of orders for realistic demo history
    print("Generating demo prediction records...")
    db.query(Prediction).delete()
    recent_sample = df.tail(120)
    sample_X = recent_sample[feature_cols]
    sample_probs = best_pipe.predict_proba(sample_X)[:, 1]
    sample_preds = best_pipe.predict(sample_X)

    for i, (_, row) in enumerate(recent_sample.iterrows()):
        prob = float(sample_probs[i])
        pred_cls = int(sample_preds[i])
        if prob < 0.15:
            tier = "Low"
        elif prob < 0.35:
            tier = "Moderate"
        elif prob < 0.60:
            tier = "High"
        else:
            tier = "Critical"

        input_data = {
            "category_name": row["category_name"],
            "selling_price": row["selling_price"],
            "discount_amount": row["discount_amount"],
            "customer_order_count": int(row["customer_order_count"]),
            "customer_prior_return_rate": round(float(row["customer_prior_return_rate"]), 3),
            "estimated_delivery_days": int(row["estimated_delivery_days"]),
            "shipping_state": row["shipping_state"],
            "payment_method": row["payment_method"],
            "order_quantity": int(row["order_quantity"])
        }

        pred_rec = Prediction(
            order_reference=row["order_number"],
            model_version=model_version,
            predicted_probability=round(prob, 4),
            predicted_class=pred_cls,
            risk_tier=tier,
            input_features=json.dumps(input_data),
            actual_outcome=int(row["is_returned"]),
            created_at=datetime.utcnow()
        )
        db.add(pred_rec)

    db.commit()
    db.close()
    print("Model training, evaluation, and registration completed successfully.")

if __name__ == "__main__":
    train_and_evaluate_models()
