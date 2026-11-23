import React, { useState, useEffect } from "react";
import {
  BrainCircuit, Sparkles, AlertCircle, CheckCircle, BarChart3,
  TrendingUp, TrendingDown, ShieldAlert, Clock, ArrowRight, History
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { api } from "../api/client";
import { PredictionResult, ModelPerformance } from "../types";

export const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"predict" | "model" | "history">("predict");

  // Form State
  const [categoryName, setCategoryName] = useState<string>("Apparel & Fashion");
  const [sellingPrice, setSellingPrice] = useState<number>(1899.0);
  const [discountAmount, setDiscountAmount] = useState<number>(200.0);
  const [customerOrderCount, setCustomerOrderCount] = useState<number>(2);
  const [customerPriorReturnRate, setCustomerPriorReturnRate] = useState<number>(0.15);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(4);
  const [shippingState, setShippingState] = useState<string>("Maharashtra");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [orderReference, setOrderReference] = useState<string>("");

  // Prediction Output
  const [predicting, setPredicting] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Model Metrics
  const [modelMetrics, setModelMetrics] = useState<ModelPerformance | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  // History
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [historyPage, setHistoryPage] = useState<number>(1);

  useEffect(() => {
    // Preload model performance
    setMetricsLoading(true);
    api.getModelPerformance()
      .then(setModelMetrics)
      .catch(console.error)
      .finally(() => setMetricsLoading(false));

    // Preload history
    api.getPredictionHistory(undefined, 1)
      .then((res) => {
        setHistoryItems(res.items);
        setHistoryTotal(res.total);
      })
      .catch(console.error);
  }, []);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredictError(null);

    api.predictReturn({
      category_name: categoryName,
      selling_price: sellingPrice,
      discount_amount: discountAmount,
      customer_order_count: customerOrderCount,
      customer_prior_return_rate: customerPriorReturnRate,
      estimated_delivery_days: estimatedDeliveryDays,
      shipping_state: shippingState,
      order_quantity: orderQuantity,
      payment_method: paymentMethod,
      order_reference: orderReference || undefined
    })
      .then((res) => {
        setResult(res);
        // Refresh history
        api.getPredictionHistory(undefined, 1).then((h) => {
          setHistoryItems(h.items);
          setHistoryTotal(h.total);
        });
      })
      .catch((err) => {
        setPredictError(err.message || "Failed to execute prediction pipeline");
      })
      .finally(() => setPredicting(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Predictive Return Analytics</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF2F0] text-[#E47D68] uppercase">
              Supervised ML
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F3F6FA] border border-[#DFE6EF] rounded-md p-0.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("predict")}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTab === "predict" ? "bg-[#3567C8] text-white shadow-xs" : "text-[#718096] hover:text-[#26364B]"
            }`}
          >
            Inference Sandbox
          </button>
          <button
            onClick={() => setActiveTab("model")}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTab === "model" ? "bg-[#3567C8] text-white shadow-xs" : "text-[#718096] hover:text-[#26364B]"
            }`}
          >
            Model Performance
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTab === "history" ? "bg-[#3567C8] text-white shadow-xs" : "text-[#718096] hover:text-[#26364B]"
            }`}
          >
            Prediction Log ({historyTotal})
          </button>
        </div>
      </div>

      {/* TAB 1: INFERENCE SANDBOX */}
      {activeTab === "predict" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 returvex-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE6EF]">
              <div>
                <h2 className="text-sm font-semibold text-[#24344D]">Order Risk Simulation Parameters</h2>
                <p className="text-[11px] text-[#718096]">
                  Enter order attributes available at purchase checkout.
                </p>
              </div>
              <span className="text-[10px] text-[#3567C8] bg-[#EAF0F7] px-2 py-0.5 rounded font-mono">
                Model: RF-Classifier v1.0
              </span>
            </div>

            <form onSubmit={handlePredict} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Product Category</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="field-input text-xs"
                  >
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Books & Media">Books & Media</option>
                    <option value="Toys & Baby">Toys & Baby</option>
                    <option value="Jewellery & Accessories">Jewellery & Accessories</option>
                    <option value="Bags & Luggage">Bags & Luggage</option>
                    <option value="Watches & Wearables">Watches & Wearables</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Discount Amount */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Promotional Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Order Quantity */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Item Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Customer Prior Orders */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Customer Order History Count</label>
                  <input
                    type="number"
                    min="1"
                    value={customerOrderCount}
                    onChange={(e) => setCustomerOrderCount(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Customer Prior Return Rate */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">
                    Customer Prior Return Rate (0.0 to 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={customerPriorReturnRate}
                    onChange={(e) => setCustomerPriorReturnRate(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Estimated Delivery Days */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Estimated Courier Transit (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={estimatedDeliveryDays}
                    onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value))}
                    className="field-input font-mono"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="field-input text-xs"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>

                {/* Shipping State */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Shipping State</label>
                  <select
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="field-input text-xs"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Assam">Assam (Remote Corridor)</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                </div>

                {/* Optional Order Reference */}
                <div>
                  <label className="block font-medium text-[#26364B] mb-1">Order Ref (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-TEST-999"
                    value={orderReference}
                    onChange={(e) => setOrderReference(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              {predictError && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
                  {predictError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={predicting}
                  className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2 text-xs font-semibold"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>{predicting ? "Running Classifier..." : "Execute Return Risk Prediction"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Inference Result (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {result ? (
              <div className="returvex-card p-5 space-y-4 border-t-3 border-t-[#3567C8]">
                <div className="flex items-center justify-between pb-2 border-b border-[#DFE6EF]">
                  <span className="text-xs font-mono font-medium text-[#718096]">
                    Ref: {result.order_reference}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                      result.risk_tier === "Critical"
                        ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
                        : result.risk_tier === "High"
                        ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                        : result.risk_tier === "Moderate"
                        ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                        : "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                    }`}
                  >
                    {result.risk_tier} Risk
                  </span>
                </div>

                {/* Probability Meter */}
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF] text-center space-y-2">
                  <span className="text-[11px] text-[#718096] uppercase font-semibold">
                    Estimated Return Probability
                  </span>
                  <div className="text-3xl font-bold font-mono text-[#24344D]">
                    {(result.predicted_probability * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.predicted_probability > 0.5
                          ? "bg-[#E47D68]"
                          : result.predicted_probability > 0.25
                          ? "bg-[#D5A64A]"
                          : "bg-[#58A88B]"
                      }`}
                      style={{ width: `${Math.min(100, result.predicted_probability * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#718096]">
                    Binary Class: {result.predicted_class === 1 ? "Returned (1)" : "Not Returned (0)"}
                  </p>
                </div>

                {/* Contributing Factors */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
                    Key Influencing Factors
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {result.top_contributing_factors.map((f, i) => {
                      const isUp = f.impact === "Increases Risk";
                      return (
                        <div
                          key={i}
                          className="p-2 rounded bg-white border border-[#DFE6EF] flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-1.5 truncate">
                            {isUp ? (
                              <TrendingUp className="w-3.5 h-3.5 text-[#E47D68] shrink-0" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-[#58A88B] shrink-0" />
                            )}
                            <span className="text-[#24344D] truncate font-medium text-[11px]">{f.label}</span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold shrink-0 ${
                              isUp ? "text-[#E47D68]" : "text-[#58A88B]"
                            }`}
                          >
                            {f.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-[#24344D]">Model Narrative:</span>
                  <p className="text-[#718096] text-[11px] leading-relaxed bg-[#F8FAFC] p-2.5 rounded border border-[#DFE6EF]">
                    {result.explanation}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="p-3 rounded-lg bg-[#EAF0F7] border border-[#BAC7D8] text-xs space-y-1">
                  <div className="flex items-center space-x-1 text-[#3567C8] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Actionable Intervention:</span>
                  </div>
                  <p className="text-[#26364B] leading-relaxed text-[11px]">
                    {result.actionable_recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="returvex-card p-8 text-center text-xs text-[#718096] space-y-3">
                <BrainCircuit className="w-10 h-10 text-[#91A0B5] mx-auto opacity-60" />
                <h3 className="font-semibold text-sm text-[#24344D]">Ready to Predict</h3>
                <p className="text-[11px] max-w-xs mx-auto">
                  Adjust order attributes on the left and run inference to calculate return risk, examine contributing factors, and view preventative actions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODEL PERFORMANCE */}
      {activeTab === "model" && modelMetrics && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="returvex-card p-3.5">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Accuracy</span>
              <p className="text-xl font-bold font-mono text-[#24344D] mt-0.5">
                {(modelMetrics.accuracy * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-[#58A88B]">Balanced Test Set</span>
            </div>
            <div className="returvex-card p-3.5">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Precision</span>
              <p className="text-xl font-bold font-mono text-[#3567C8] mt-0.5">
                {(modelMetrics.precision * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-[#718096]">True Pos / All Pos</span>
            </div>
            <div className="returvex-card p-3.5">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">Recall (Sensitivity)</span>
              <p className="text-xl font-bold font-mono text-[#E47D68] mt-0.5">
                {(modelMetrics.recall * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-[#718096]">Captured Returns</span>
            </div>
            <div className="returvex-card p-3.5">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">F1-Score</span>
              <p className="text-xl font-bold font-mono text-[#8978C6] mt-0.5">
                {modelMetrics.f1_score.toFixed(3)}
              </p>
              <span className="text-[10px] text-[#718096]">Harmonic Mean</span>
            </div>
            <div className="returvex-card p-3.5">
              <span className="text-[10px] text-[#718096] uppercase font-semibold">ROC-AUC</span>
              <p className="text-xl font-bold font-mono text-[#24344D] mt-0.5">
                {modelMetrics.roc_auc.toFixed(3)}
              </p>
              <span className="text-[10px] text-[#58A88B]">Discrimination Power</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importances Chart */}
            <div className="returvex-card p-5 space-y-3">
              <div className="pb-2 border-b border-[#DFE6EF]">
                <h3 className="text-sm font-semibold text-[#24344D]">Top Gini Feature Importances</h3>
                <p className="text-[11px] text-[#718096]">
                  Relative contribution of input features to Random Forest branch splits.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modelMetrics.feature_importances.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      stroke="#26364B"
                      fontSize={10}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#DFE6EF",
                        borderRadius: "6px",
                        fontSize: "11px"
                      }}
                      formatter={(val: any) => [val, "Gini Importance"]}
                    />
                    <Bar dataKey="importance" fill="#3567C8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confusion Matrix & Technical Details */}
            <div className="returvex-card p-5 space-y-4">
              <div className="pb-2 border-b border-[#DFE6EF]">
                <h3 className="text-sm font-semibold text-[#24344D]">Model Confusion Matrix & Architecture</h3>
                <p className="text-[11px] text-[#718096]">
                  {modelMetrics.model_name} • Algorithm: {modelMetrics.algorithm} • v{modelMetrics.version}
                </p>
              </div>

              {/* Confusion Matrix Grid */}
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <span className="text-[10px] text-[#16A34A] font-semibold uppercase">True Negatives</span>
                  <p className="text-xl font-bold font-mono text-[#16A34A] mt-1">
                    {modelMetrics.confusion_matrix.true_negatives}
                  </p>
                  <span className="text-[10px] text-[#718096]">Correctly Not Returned</span>
                </div>
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                  <span className="text-[10px] text-[#DC2626] font-semibold uppercase">False Positives</span>
                  <p className="text-xl font-bold font-mono text-[#DC2626] mt-1">
                    {modelMetrics.confusion_matrix.false_positives}
                  </p>
                  <span className="text-[10px] text-[#718096]">Predicted Return (Actually Kept)</span>
                </div>
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                  <span className="text-[10px] text-[#DC2626] font-semibold uppercase">False Negatives</span>
                  <p className="text-xl font-bold font-mono text-[#DC2626] mt-1">
                    {modelMetrics.confusion_matrix.false_negatives}
                  </p>
                  <span className="text-[10px] text-[#718096]">Missed Returns</span>
                </div>
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <span className="text-[10px] text-[#16A34A] font-semibold uppercase">True Positives</span>
                  <p className="text-xl font-bold font-mono text-[#16A34A] mt-1">
                    {modelMetrics.confusion_matrix.true_positives}
                  </p>
                  <span className="text-[10px] text-[#718096]">Correctly Identified Returns</span>
                </div>
              </div>

              {/* Zero Leakage Audit Note */}
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DFE6EF] text-[11px] text-[#718096] leading-relaxed">
                <p className="font-semibold text-[#24344D] mb-1">Zero-Leakage Training Guarantee:</p>
                {modelMetrics.notes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTION HISTORY */}
      {activeTab === "history" && (
        <div className="returvex-card overflow-hidden">
          <div className="p-4 border-b border-[#DFE6EF] bg-[#F8FAFC] flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#24344D]">Inference History Audit Log</h3>
              <p className="text-[11px] text-[#718096]">Past predictions stored with actual outcome comparison.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="table-head">
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Probability</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Actual Outcome</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE6EF]">
                {historyItems.map((h) => (
                  <tr key={h.id} className="hover:bg-[#F3F6FA]">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#3567C8]">{h.order_reference}</td>
                    <td className="py-2.5 px-3 font-mono text-[#718096]">{h.model_version}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      {(h.predicted_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          h.risk_tier === "Critical"
                            ? "bg-[#FEF2F2] text-[#DC2626]"
                            : h.risk_tier === "High"
                            ? "bg-[#FFFBEB] text-[#D97706]"
                            : "bg-[#F0FDF4] text-[#16A34A]"
                        }`}
                      >
                        {h.risk_tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#718096]">{h.input_features?.category_name || "N/A"}</td>
                    <td className="py-2.5 px-3 text-[#718096]">{h.input_features?.shipping_state || "N/A"}</td>
                    <td className="py-2.5 px-3 text-[#718096]">{h.input_features?.payment_method || "N/A"}</td>
                    <td className="py-2.5 px-3 font-medium">
                      {h.actual_outcome === 1 ? (
                        <span className="text-[#E47D68]">Returned (1)</span>
                      ) : h.actual_outcome === 0 ? (
                        <span className="text-[#58A88B]">Kept (0)</span>
                      ) : (
                        <span className="text-[#91A0B5]">Pending Fulfillment</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#718096] whitespace-nowrap">
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
