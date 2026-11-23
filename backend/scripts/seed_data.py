import os
import sys
import random
import json
from datetime import datetime, timedelta
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, Base, engine
from app.models.entities import (
    Category, Vendor, Product, Customer, Order, OrderItem,
    Return, AuditLog, SystemSetting
)

def generate_synthetic_data(num_customers=1000, num_products=100, num_orders=5000, seed=42):
    random.seed(seed)
    
    # Recreate tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Seeding system settings...")
    default_settings = [
        ("currency_symbol", "₹", "Default currency symbol"),
        ("reverse_logistics_fee", "120.0", "Fixed reverse logistics fee per item"),
        ("restocking_percent", "0.05", "Restocking cost as a fraction of selling price"),
        ("write_off_percent", "0.15", "Write-off cost percentage for damaged items"),
        ("recoverable_percent", "0.80", "Recoverable inventory value fraction"),
        ("risk_threshold_low", "8.0", "Low risk threshold percentage"),
        ("risk_threshold_moderate", "15.0", "Moderate risk threshold percentage"),
        ("risk_threshold_high", "25.0", "High risk threshold percentage")
    ]
    for k, v, desc in default_settings:
        db.add(SystemSetting(key=k, value=v, description=desc, updated_at=datetime.utcnow()))
    db.commit()

    print("Seeding categories...")
    categories_data = [
        "Apparel & Fashion",
        "Footwear",
        "Electronics & Gadgets",
        "Home & Kitchen",
        "Beauty & Cosmetics",
        "Sports & Fitness",
        "Books & Media",
        "Toys & Baby",
        "Jewellery & Accessories",
        "Bags & Luggage",
        "Watches & Wearables",
        "Personal Care"
    ]
    categories = []
    for cat_name in categories_data:
        cat = Category(category_name=cat_name)
        db.add(cat)
        categories.append(cat)
    db.commit()

    print("Seeding vendors...")
    vendors_data = [
        ("Apex Traders India", "VND-APEX"),
        ("Zenith Supply Co.", "VND-ZNTH"),
        ("Bharat Essentials Ltd.", "VND-BHRT"),
        ("Nova Retail Solutions", "VND-NOVA"),  # Has quality defect batch
        ("Deccan Mercantile", "VND-DECN"),
        ("Himalayan Crafts Collective", "VND-HIML"),
        ("Mumbai Fabric Works", "VND-MUMB"),
        ("Ganges Logistics & Sourcing", "VND-GANG")
    ]
    vendors = []
    for v_name, v_code in vendors_data:
        v = Vendor(vendor_name=v_name, vendor_code=v_code)
        db.add(v)
        vendors.append(v)
    db.commit()

    print("Seeding products...")
    # Pre-configure specific product types per category with pricing
    product_templates = {
        "Apparel & Fashion": [
            ("Slim Fit Stretch Denim Jeans", 1899.0, "DenimCorp", "HIGH_SIZE_RISK"),
            ("Oversized Cotton Graphic T-Shirt", 899.0, "UrbanVibe", "NORMAL"),
            ("Formal Linen Nehru Jacket", 3499.0, "RoyalKriti", "HIGH_SIZE_RISK"),
            ("Chanderi Silk Printed Saree", 4299.0, "VaranasiWeaves", "NORMAL"),
            ("Active Dry-Fit Polo T-Shirt", 1199.0, "AeroFit", "NORMAL"),
            ("Winter Wool Blend Cardigan", 2299.0, "NordicKnit", "NORMAL"),
            ("Relaxed Fit Cargo Trousers", 1799.0, "TrailGear", "HIGH_SIZE_RISK"),
            ("Cotton Kurta Pajama Set", 1999.0, "EthnicAura", "NORMAL")
        ],
        "Footwear": [
            ("Pro-Stride Running Shoes", 3299.0, "FleetFeet", "HIGH_SIZE_RISK"),
            ("Genuine Leather Oxford Shoes", 4499.0, "Monarch", "HIGH_SIZE_RISK"),
            ("Lightweight Slip-On Sneakers", 1699.0, "WalkEasy", "NORMAL"),
            ("Waterproof Hiking Boots", 5299.0, "SummitPro", "NORMAL"),
            ("Traditional Kolhapuri Sandals", 1299.0, "CraftsHeritage", "NORMAL"),
            ("Comfort Memory Foam Flip-Flops", 699.0, "CloudStep", "LOW_RISK"),
            ("Women Ankle Strap Block Heels", 2799.0, "GlamWalk", "HIGH_SIZE_RISK"),
            ("Canvas High-Top Casuals", 1499.0, "StreetPulse", "NORMAL")
        ],
        "Electronics & Gadgets": [
            ("True Wireless ANC Earbuds V2", 2999.0, "AcousticNova", "HIGH_QUALITY_RISK"),  # Supplied by Nova Retail!
            ("10,000mAh Magnetic Power Bank", 1499.0, "VoltCore", "NORMAL"),
            ("4K Ultra-HD Webcam with Mic", 3899.0, "VisionTech", "NORMAL"),
            ("Mechanical RGB Gaming Keyboard", 4299.0, "KeyForge", "NORMAL"),
            ("Ergonomic Vertical Wireless Mouse", 1799.0, "GripMaster", "LOW_RISK"),
            ("Fast Dual USB-C GaN Charger 65W", 2199.0, "VoltCore", "NORMAL"),
            ("Smart Fitness Band Tracker", 2499.0, "PulseX", "HIGH_QUALITY_RISK"),
            ("Portable Bluetooth Stereo Speaker", 1999.0, "SoundWave", "NORMAL")
        ],
        "Home & Kitchen": [
            ("Tri-Ply Stainless Steel Kadhai", 2899.0, "PristineSteel", "LOW_RISK"),
            ("Non-Stick Ceramic Frying Pan", 1599.0, "ChefChoice", "NORMAL"),
            ("Cold Press Masticating Juicer", 6499.0, "NutriPure", "NORMAL"),
            ("Electric Cordless Kettle 1.8L", 1299.0, "SwiftBoil", "NORMAL"),
            ("Microfiber Fitted Bed Sheet Set", 1199.0, "LoomCraft", "NORMAL"),
            ("Aroma Oil Ultrasonic Diffuser", 1399.0, "ZenSpace", "NORMAL"),
            ("Aero-Mesh Ergonomic Desk Chair", 8999.0, "ComfortZone", "NORMAL"),
            ("Glass Food Container Set (6 pcs)", 1099.0, "ClearSeal", "LOW_RISK")
        ],
        "Beauty & Cosmetics": [
            ("Vitamin C Glowing Face Serum", 699.0, "DermaGlow", "LOW_RISK"),
            ("SPF 50 Ultra-Matte Sunscreen", 549.0, "SolarShield", "LOW_RISK"),
            ("Hydrating Hyaluronic Acid Cream", 849.0, "PureAqua", "LOW_RISK"),
            ("Matte Liquid Lipstick Trio", 999.0, "VelvetLuxe", "NORMAL"),
            ("Argan Oil Hair Repair Mask", 799.0, "LustreRoots", "NORMAL"),
            ("Organic Charcoal Clay Face Wash", 399.0, "EarthBlend", "LOW_RISK"),
            ("Rosemary Hair Growth Tonic", 649.0, "Botanica", "LOW_RISK"),
            ("Luxury Eau De Parfum 100ml", 2899.0, "AuraScent", "NORMAL")
        ],
        "Sports & Fitness": [
            ("Anti-Slip TPE Yoga Mat 6mm", 999.0, "AsanaZen", "LOW_RISK"),
            ("Adjustable Hex Dumbbell Pair 5kg", 1899.0, "IronGrip", "LOW_RISK"),
            ("Latex Resistance Loop Bands Set", 499.0, "FlexiBand", "LOW_RISK"),
            ("Stainless Steel Insulated Shaker", 899.0, "HydraFuel", "LOW_RISK"),
            ("High-Speed Ball Bearing Jump Rope", 399.0, "CardioMax", "LOW_RISK"),
            ("Ankle & Wrist Weighted Straps", 799.0, "TonePro", "LOW_RISK"),
            ("Gym Duffel Bag with Shoe Pocket", 1499.0, "AeroFit", "NORMAL"),
            ("Foam Roller for Muscle Relief", 899.0, "RehabPlus", "LOW_RISK")
        ],
        "Books & Media": [
            ("Data Structures & Algorithms in Python", 799.0, "TechPress", "LOW_RISK"),
            ("Enterprise AI Architecture Handbook", 1299.0, "DataMatrix", "LOW_RISK"),
            ("Modern Business Strategy & Growth", 649.0, "ApexPublishing", "LOW_RISK"),
            ("Mindset & Emotional Resilience", 499.0, "BeaconBooks", "LOW_RISK"),
            ("The Complete Indian Recipe Treasury", 999.0, "HeritageKitchen", "LOW_RISK"),
            ("World History Visual Encyclopedia", 1499.0, "GlobalChronicle", "LOW_RISK"),
            ("Machine Learning System Design", 1199.0, "TechPress", "LOW_RISK"),
            ("Finance for Tech Leaders", 899.0, "ApexPublishing", "LOW_RISK")
        ],
        "Toys & Baby": [
            ("STEM Robotic Coding Kit for Kids", 2899.0, "LittleGenius", "NORMAL"),
            ("Magnetic Building Blocks (100 pcs)", 1999.0, "WonderPlay", "NORMAL"),
            ("Silicone Baby Teething & Feeding Set", 899.0, "BabyPure", "LOW_RISK"),
            ("Eco-Friendly Wooden Train Track", 1499.0, "WoodCraftKids", "LOW_RISK"),
            ("Soft Plush Animal Rocking Horse", 3499.0, "SnuggleNest", "NORMAL"),
            ("Musical Keyboard & Learning Pad", 1299.0, "HappyTune", "NORMAL"),
            ("All-Terrain Remote Control Car", 2199.0, "TurboRacer", "NORMAL"),
            ("Baby Carrier Ergonomic 4-Position", 2799.0, "CuddleWrap", "HIGH_SIZE_RISK")
        ],
        "Jewellery & Accessories": [
            ("925 Sterling Silver Solitaire Ring", 2499.0, "ShineCraft", "HIGH_SIZE_RISK"),
            ("Rose Gold Plated Pearl Pendant", 1899.0, "AuraGems", "NORMAL"),
            ("Handcrafted Oxidised Silver Choker", 1299.0, "EthnicSpark", "NORMAL"),
            ("Classic Aviator Polarized Sunglasses", 1599.0, "VeloceOptics", "NORMAL"),
            ("Swarovski Crystal Drop Earrings", 2999.0, "GlamourEdge", "NORMAL"),
            ("Pure Silk Pocket Square Box of 3", 899.0, "DapperClub", "LOW_RISK"),
            ("Titanium Minimalist Cuff Bracelet", 1499.0, "UrbanSteel", "NORMAL"),
            ("Handmade Wooden Jewellery Box", 1799.0, "HeritageKriti", "LOW_RISK")
        ],
        "Bags & Luggage": [
            ("Water-Resistant Laptop Backpack 25L", 2199.0, "NomadX", "NORMAL"),
            ("Hard-Shell Polycarbonate Cabin Trolley", 4999.0, "VoyagerPro", "NORMAL"),
            ("Vegan Leather Executive Briefcase", 3699.0, "UrbanCraft", "NORMAL"),
            ("Weekender Canvas Travel Duffle", 2499.0, "TrailPack", "NORMAL"),
            ("Crossbody Anti-Theft Sling Bag", 1199.0, "CityShield", "NORMAL"),
            ("Foldable Ultralight Gym Bag", 699.0, "GoLite", "LOW_RISK"),
            ("Checked Luggage 28-Inch Polypropylene", 6999.0, "VoyagerPro", "NORMAL"),
            ("RFID Blocking Slim Leather Wallet", 899.0, "SecureFold", "LOW_RISK")
        ],
        "Watches & Wearables": [
            ("Analog Stainless Steel Chronograph", 5499.0, "ChronosIndia", "NORMAL"),
            ("AMOLED Smartwatch with BT Calling", 3799.0, "NovaRetail", "HIGH_QUALITY_RISK"),
            ("Classic Leather Strap Dress Watch", 3299.0, "TitaniumHeritage", "NORMAL"),
            ("Shock-Resistant Tactical Digital Watch", 2199.0, "ToughTime", "LOW_RISK"),
            ("Minimalist Rose Gold Mesh Watch", 2899.0, "AuraTime", "NORMAL"),
            ("GPS Multi-Sport Fitness Smartwatch", 8999.0, "PulseX", "NORMAL"),
            ("Automatic Mechanical Skeleton Watch", 11999.0, "GenevaCraft", "NORMAL"),
            ("Hybrid Smart Analogue Watch", 4499.0, "ChronosIndia", "NORMAL")
        ],
        "Personal Care": [
            ("Sonic Electric Toothbrush USB-C", 1699.0, "SmileBright", "NORMAL"),
            ("Cordless Multi-Grooming Beard Trimmer", 1499.0, "BladeMaster", "NORMAL"),
            ("Ionic Hair Dryer with Diffuser", 2299.0, "SalonPro", "NORMAL"),
            ("Deep Tissue Percussion Massage Gun", 3499.0, "TheraRelief", "NORMAL"),
            ("Titanium Ceramic Hair Straightener", 1899.0, "SilkGlide", "NORMAL"),
            ("Ultrasonic Waterproof Facial Cleanser", 1299.0, "GlowSpa", "NORMAL"),
            ("Rechargeable Callus Remover Pedicure", 999.0, "PediCare", "LOW_RISK"),
            ("Nose & Ear Trimmer Dual-Edge Blade", 499.0, "PrecisionCut", "LOW_RISK")
        ]
    }

    products = []
    p_counter = 1
    product_risk_meta = {}

    for cat_name, templates in product_templates.items():
        cat = next(c for c in categories if c.category_name == cat_name)
        for name, price, brand, risk_flag in templates:
            # Assign vendor; for HIGH_QUALITY_RISK assign Nova Retail (vendor index 3)
            if risk_flag == "HIGH_QUALITY_RISK":
                vendor = vendors[3]
            else:
                vendor = random.choice(vendors)
            
            p_code = f"PRD-{cat.id:02d}-{p_counter:03d}"
            prod = Product(
                product_code=p_code,
                product_name=name,
                category_id=cat.id,
                brand=brand,
                vendor_id=vendor.id,
                selling_price=price,
                created_at=datetime.utcnow() - timedelta(days=random.randint(180, 365))
            )
            db.add(prod)
            products.append(prod)
            product_risk_meta[p_code] = risk_flag
            p_counter += 1

    # Add extra products to reach exact num_products (100)
    extra_idx = 1
    while len(products) < num_products:
        cat = random.choice(categories)
        vendor = random.choice(vendors)
        price = round(random.uniform(499.0, 7999.0), -1) + 99.0
        p_code = f"PRD-{cat.id:02d}-{p_counter:03d}"
        prod = Product(
            product_code=p_code,
            product_name=f"Premium {cat.category_name.split()[0]} Model {extra_idx}",
            category_id=cat.id,
            brand="BharatCraft",
            vendor_id=vendor.id,
            selling_price=price,
            created_at=datetime.utcnow() - timedelta(days=random.randint(180, 365))
        )
        db.add(prod)
        products.append(prod)
        product_risk_meta[p_code] = "NORMAL"
        p_counter += 1
        extra_idx += 1

    db.commit()

    print(f"Seeded {len(products)} products.")

    print("Seeding customers...")
    regions_map = {
        "West": ["Maharashtra", "Gujarat", "Goa"],
        "South": ["Karnataka", "Tamil Nadu", "Telangana", "Kerala", "Andhra Pradesh"],
        "North": ["Delhi", "Uttar Pradesh", "Haryana", "Punjab", "Rajasthan"],
        "East": ["West Bengal", "Odisha", "Bihar", "Assam"],
        "Central": ["Madhya Pradesh", "Chhattisgarh"]
    }
    
    first_names = [
        "Aarav", "Aditi", "Ananya", "Arjun", "Deepak", "Divya", "Gaurav", "Isha",
        "Karan", "Kavita", "Manish", "Meera", "Neha", "Nikhil", "Pooja", "Pranav",
        "Priya", "Rahul", "Rakesh", "Riya", "Rohan", "Sanjay", "Shreya", "Siddharth",
        "Sneha", "Sunil", "Tanvi", "Varun", "Vikas", "Vikram", "Zoya", "Ritu", "Sameer",
        "Aakash", "Bhavna", "Chirag", "Dinesh", "Ekta", "Farhan", "Harish", "Jaspreet"
    ]
    last_names = [
        "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Mehta", "Deshmukh",
        "Gupta", "Malhotra", "Kulkarni", "Chauhan", "Bhatt", "Rao", "Joshi", "Das",
        "Mukherjee", "Singh", "Yadav", "Chatterjee", "Menon", "Pillai", "Agarwal", "Bansal"
    ]
    segments = ["Consumer", "Corporate", "Small Business"]
    segment_weights = [0.75, 0.15, 0.10]

    customers = []
    customer_return_propensities = {}

    for i in range(1, num_customers + 1):
        c_code = f"CUST-{i:05d}"
        c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        region = random.choice(list(regions_map.keys()))
        state = random.choice(regions_map[region])
        segment = random.choices(segments, weights=segment_weights)[0]
        
        # A small fraction of customers are habitual returners (~5%)
        propensity = random.choices([0.05, 0.12, 0.40], weights=[0.70, 0.25, 0.05])[0]
        customer_return_propensities[c_code] = propensity

        cust = Customer(
            customer_code=c_code,
            customer_name=c_name,
            region=region,
            state=state,
            customer_segment=segment,
            created_at=datetime.utcnow() - timedelta(days=random.randint(90, 360))
        )
        db.add(cust)
        customers.append(cust)
    db.commit()
    print(f"Seeded {len(customers)} customers.")

    print("Seeding orders and returns...")
    payment_methods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"]
    payment_weights = [0.45, 0.25, 0.12, 0.08, 0.10]
    
    # Controlled return reasons
    return_reasons_pool = [
        "Size/Fit Issue",
        "Product Quality",
        "Damaged Product",
        "Incorrect Item",
        "Product Not as Described",
        "Late Delivery",
        "Changed Mind",
        "Other"
    ]

    orders = []
    returns = []
    
    start_date = datetime.utcnow() - timedelta(days=120)
    
    # We will track customer order counts for realism
    cust_orders_count = {c.id: 0 for c in customers}
    cust_returns_count = {c.id: 0 for c in customers}

    return_counter = 1

    for o_idx in range(1, num_orders + 1):
        order_num = f"ORD-2026-{o_idx:05d}"
        cust = random.choice(customers)
        cust_orders_count[cust.id] += 1
        
        # Order date distributed over the last 120 days
        days_offset = random.triangular(0, 120, 90) # heavier recent orders
        o_date = start_date + timedelta(days=days_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        
        # Delivery delay: normally 2-5 days; remote states 5-9 days
        is_remote = cust.state in ["Assam", "Bihar", "Odisha", "Jammu & Kashmir"]
        transit_days = random.randint(4, 9) if is_remote else random.randint(2, 5)
        deliv_date = o_date + timedelta(days=transit_days)

        pay_method = random.choices(payment_methods, weights=payment_weights)[0]
        
        # Select 1 to 2 items per order
        num_items = random.choices([1, 2], weights=[0.85, 0.15])[0]
        selected_prods = random.sample(products, num_items)
        
        order_total = 0.0
        item_objects = []

        for prod in selected_prods:
            qty = 1 if prod.selling_price > 2000 else random.choices([1, 2], weights=[0.85, 0.15])[0]
            # Occasional promotional discount
            discount = round(prod.selling_price * random.choice([0.0, 0.05, 0.10, 0.15, 0.20]), 2)
            line_tot = (prod.selling_price * qty) - discount
            order_total += line_tot
            item_objects.append((prod, qty, prod.selling_price, discount, line_tot))

        # Check return likelihood based on controlled patterns
        primary_prod = selected_prods[0]
        p_risk = product_risk_meta[primary_prod.product_code]
        c_propensity = customer_return_propensities[cust.customer_code]

        # Base return rate ~10%
        return_chance = 0.09 + c_propensity
        
        # High size risk products have ~28% return chance
        if p_risk == "HIGH_SIZE_RISK":
            return_chance += 0.20
        # High quality risk products have ~32% return chance
        elif p_risk == "HIGH_QUALITY_RISK":
            return_chance += 0.24
        elif p_risk == "LOW_RISK":
            return_chance = max(0.02, return_chance - 0.07)

        # Cash on delivery has slightly higher return/rejection rate
        if pay_method == "Cash on Delivery":
            return_chance += 0.06

        # Remote delays have slightly higher late delivery return
        if transit_days > 6:
            return_chance += 0.08

        # Cap between 2% and 65%
        return_chance = min(0.65, max(0.02, return_chance))
        is_returned = random.random() < return_chance
        
        # Delivery status
        if is_returned:
            o_status = "Returned"
        else:
            o_status = "Delivered"

        order = Order(
            order_number=order_num,
            customer_id=cust.id,
            order_date=o_date,
            payment_method=pay_method,
            shipping_state=cust.state,
            delivery_date=deliv_date,
            order_status=o_status,
            total_amount=round(order_total, 2)
        )
        db.add(order)
        db.flush() # get order.id

        for prod, qty, u_price, disc, l_tot in item_objects:
            oi = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=u_price,
                discount_amount=disc,
                line_total=l_tot
            )
            db.add(oi)

        if is_returned:
            cust_returns_count[cust.id] += 1
            ret_date = deliv_date + timedelta(days=random.randint(1, 10))
            
            # Select realistic return reason
            if p_risk == "HIGH_SIZE_RISK":
                reason = random.choices(
                    ["Size/Fit Issue", "Changed Mind", "Product Not as Described"],
                    weights=[0.75, 0.15, 0.10]
                )[0]
            elif p_risk == "HIGH_QUALITY_RISK":
                reason = random.choices(
                    ["Product Quality", "Damaged Product", "Product Not as Described"],
                    weights=[0.65, 0.25, 0.10]
                )[0]
            elif transit_days > 6 and random.random() < 0.40:
                reason = "Late Delivery"
            else:
                reason = random.choices(
                    return_reasons_pool,
                    weights=[0.28, 0.20, 0.14, 0.10, 0.10, 0.08, 0.06, 0.04]
                )[0]

            refund = order_total
            # Financial components
            rev_logistics = round(random.uniform(110.0, 180.0), 2)
            restocking = round(order_total * 0.05, 2)
            
            if reason in ["Damaged Product", "Product Quality"]:
                write_off = round(order_total * random.uniform(0.15, 0.35), 2)
                recoverable = round(order_total * random.uniform(0.10, 0.30), 2)
            elif reason in ["Size/Fit Issue", "Changed Mind"]:
                write_off = 0.0
                recoverable = round(order_total * random.uniform(0.85, 0.95), 2)
            else:
                write_off = round(order_total * 0.05, 2)
                recoverable = round(order_total * 0.75, 2)

            ret_num = f"RET-2026-{return_counter:05d}"
            return_counter += 1

            ret_record = Return(
                return_number=ret_num,
                order_id=order.id,
                customer_id=cust.id,
                product_id=primary_prod.id,
                return_date=ret_date,
                return_reason=reason,
                return_status=random.choices(["Completed", "Approved", "Inspected"], weights=[0.85, 0.10, 0.05])[0],
                refund_amount=refund,
                reverse_logistics_cost=rev_logistics,
                restocking_cost=restocking,
                write_off_cost=write_off,
                recoverable_value=recoverable
            )
            db.add(ret_record)
            returns.append(ret_record)

    db.commit()
    print(f"Seeded {num_orders} orders and {len(returns)} returns (Return Rate: {len(returns)/num_orders*100:.2f}%).")

    # Record audit log
    audit = AuditLog(
        action="SEED_DATABASE",
        entity_type="SYSTEM",
        entity_id="ALL",
        description=f"Generated synthetic demo dataset with {num_customers} customers, {num_products} products, {num_orders} orders, and {len(returns)} returns with fixed seed {seed}.",
        created_at=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    # Export sample CSV files to backend/data/ for testing import
    export_sample_csvs(db, backend_dir / "data")
    db.close()
    print("Database seeding completed successfully.")

def export_sample_csvs(db, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    import csv

    # 1. Sample Products CSV
    prods = db.query(Product).limit(10).all()
    with open(out_dir / "sample_products.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["product_code", "product_name", "category_name", "brand", "vendor_name", "selling_price"])
        for p in prods:
            writer.writerow([p.product_code, p.product_name, p.category.category_name, p.brand, p.vendor.vendor_name, p.selling_price])

    # 2. Sample Orders CSV
    orders = db.query(Order).limit(15).all()
    with open(out_dir / "sample_orders.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["order_number", "customer_code", "order_date", "payment_method", "shipping_state", "total_amount", "order_status"])
        for o in orders:
            writer.writerow([o.order_number, o.customer.customer_code, o.order_date.isoformat(), o.payment_method, o.shipping_state, o.total_amount, o.order_status])

    # 3. Sample Returns CSV
    returns = db.query(Return).limit(15).all()
    with open(out_dir / "sample_returns.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["return_number", "order_number", "product_code", "return_date", "return_reason", "refund_amount", "return_status"])
        for r in returns:
            writer.writerow([r.return_number, r.order.order_number, r.product.product_code, r.return_date.isoformat(), r.return_reason, r.refund_amount, r.return_status])

    print("Sample CSV templates exported to backend/data/")

if __name__ == "__main__":
    generate_synthetic_data()
