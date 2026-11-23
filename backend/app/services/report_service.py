import io
import csv
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi.responses import Response

from app.models.entities import Product, Return, Order, Category, Customer, Prediction
from app.services.analytics_service import get_dashboard_summary, get_regional_analysis, get_return_reasons
from app.services.financial_service import get_financial_intelligence
from app.services.product_service import get_products_list

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_report_data(
    db: Session,
    report_type: str = "executive",
    period: str = "30d",
    category_id: Optional[int] = None
) -> Dict[str, Any]:
    now = datetime.utcnow()
    
    if report_type == "executive":
        summary = get_dashboard_summary(db, period=period, category_id=category_id)
        reasons = get_return_reasons(db, period=period, category_id=category_id)
        regions = get_regional_analysis(db, period=period, category_id=category_id)
        return {
            "title": "Executive Returns Intelligence & Profitability Summary",
            "report_type": report_type,
            "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "period": period,
            "summary_kpis": {
                "return_rate": f"{summary.return_rate.value}%",
                "total_returns": int(summary.total_returns.value),
                "total_orders": summary.total_orders,
                "gross_refunds": f"₹{summary.total_refund_amount:,.2f}",
                "reverse_logistics": f"₹{summary.total_reverse_logistics:,.2f}",
                "net_loss": f"₹{summary.net_loss:,.2f}"
            },
            "top_reasons": [{"reason": r.reason, "count": r.count, "share": f"{r.percentage}%", "cost": f"₹{r.financial_cost:,.2f}"} for r in reasons[:5]],
            "top_regions": [{"state": reg.state, "orders": reg.total_orders, "returns": reg.returned_orders, "return_rate": f"{reg.return_rate}%", "impact": f"₹{reg.financial_impact:,.2f}"} for reg in regions[:5]]
        }

    elif report_type == "product":
        prod_data = get_products_list(db, category_id=category_id, page=1, page_size=50)
        return {
            "title": "Product Return Risk & Financial Impact Report",
            "report_type": report_type,
            "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "period": period,
            "products": [
                {
                    "code": p.product_code,
                    "name": p.product_name,
                    "category": p.category_name,
                    "price": f"₹{p.selling_price:,.2f}",
                    "orders": p.orders_count,
                    "returns": p.returns_count,
                    "return_rate": f"{p.return_rate}%",
                    "financial_cost": f"₹{p.financial_cost:,.2f}",
                    "risk_tier": p.risk_tier
                }
                for p in prod_data["items"]
            ]
        }

    elif report_type == "financial":
        fin = get_financial_intelligence(db, period=period, category_id=category_id)
        return {
            "title": "Financial Impact & Loss Attribution Report",
            "report_type": report_type,
            "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "period": period,
            "kpis": fin["kpis"],
            "by_category": fin["by_category"],
            "by_reason": fin["by_reason"]
        }

    else:  # regional
        regions = get_regional_analysis(db, period=period, category_id=category_id)
        return {
            "title": "Regional Return Distribution Report",
            "report_type": report_type,
            "generated_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "period": period,
            "regions": [
                {
                    "state": r.state,
                    "region": r.region,
                    "orders": r.total_orders,
                    "returns": r.returned_orders,
                    "return_rate": f"{r.return_rate}%",
                    "impact": f"₹{r.financial_impact:,.2f}"
                }
                for r in regions
            ]
        }

def export_report_csv(db: Session, report_type: str = "executive", period: str = "30d") -> Response:
    output = io.StringIO()
    writer = csv.writer(output)
    
    data = generate_report_data(db, report_type=report_type, period=period)
    
    writer.writerow(["RETURVEX Enterprise Intelligence Platform"])
    writer.writerow(["Report Title", data["title"]])
    writer.writerow(["Generated At", data["generated_at"]])
    writer.writerow(["Time Horizon", data["period"]])
    writer.writerow([])

    if report_type == "executive":
        writer.writerow(["--- PERFORMANCE OVERVIEW ---"])
        for k, v in data["summary_kpis"].items():
            writer.writerow([k.replace("_", " ").title(), v])
        writer.writerow([])
        writer.writerow(["--- TOP RETURN REASONS ---"])
        writer.writerow(["Reason", "Return Count", "Volume Share", "Financial Cost"])
        for r in data["top_reasons"]:
            writer.writerow([r["reason"], r["count"], r["share"], r["cost"]])
        writer.writerow([])
        writer.writerow(["--- TOP REGIONS BY RETURN RATE ---"])
        writer.writerow(["State", "Total Orders", "Returned Orders", "Return Rate", "Financial Impact"])
        for reg in data["top_regions"]:
            writer.writerow([reg["state"], reg["orders"], reg["returns"], reg["return_rate"], reg["impact"]])

    elif report_type == "product":
        writer.writerow(["Product Code", "Product Name", "Category", "Price", "Orders", "Returns", "Return Rate", "Financial Cost", "Risk Tier"])
        for p in data["products"]:
            writer.writerow([p["code"], p["name"], p["category"], p["price"], p["orders"], p["returns"], p["return_rate"], p["financial_cost"], p["risk_tier"]])

    elif report_type == "financial":
        writer.writerow(["--- FINANCIAL METRICS SUMMARY ---"])
        for k, v in data["kpis"].items():
            writer.writerow([k.replace("_", " ").title(), v])
        writer.writerow([])
        writer.writerow(["--- COST BREAKDOWN BY CATEGORY ---"])
        writer.writerow(["Category", "Returns Count", "Gross Refund", "Logistics Cost", "Restocking Cost", "Write-Off Cost", "Recoverable Salvage", "Net Loss"])
        for c in data["by_category"]:
            writer.writerow([c["category"], c["returns_count"], c["refund_amount"], c["logistics_cost"], c["restocking_cost"], c["write_off_cost"], c["recoverable_value"], c["net_loss"]])

    else:
        writer.writerow(["State", "Region", "Total Orders", "Returned Orders", "Return Rate", "Financial Impact"])
        for r in data["regions"]:
            writer.writerow([r["state"], r["region"], r["orders"], r["returns"], r["return_rate"], r["impact"]])

    csv_content = output.getvalue()
    filename = f"returvex_{report_type}_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def export_report_pdf(db: Session, report_type: str = "executive", period: str = "30d") -> Response:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#24344D')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#718096')
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#3567C8')
    )
    body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#26364B')
    )
    header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []
    data = generate_report_data(db, report_type=report_type, period=period)

    # Header block
    story.append(Paragraph("RETURVEX &bull; E-COMMERCE INTELLIGENCE", ParagraphStyle('TopBadge', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#3567C8'))))
    story.append(Spacer(1, 4))
    story.append(Paragraph(data["title"], title_style))
    story.append(Paragraph(f"Generated: {data['generated_at']} | Scope: {period.upper()} Window | Environment: Production Workstation", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#DFE6EF'), spaceBefore=2, spaceAfter=10))

    if report_type == "executive":
        story.append(Paragraph("1. Executive Performance KPIs", section_style))
        story.append(Spacer(1, 6))

        kpis = data["summary_kpis"]
        kpi_table_data = [
            [Paragraph(f"<b>Return Rate:</b> {kpis['return_rate']}", body_style), Paragraph(f"<b>Total Returns:</b> {kpis['total_returns']:,}", body_style)],
            [Paragraph(f"<b>Total Orders:</b> {kpis['total_orders']:,}", body_style), Paragraph(f"<b>Gross Refunds:</b> {kpis['gross_refunds']}", body_style)],
            [Paragraph(f"<b>Reverse Logistics:</b> {kpis['reverse_logistics']}", body_style), Paragraph(f"<b>Net Financial Loss:</b> {kpis['net_loss']}", body_style)]
        ]
        t_kpi = Table(kpi_table_data, colWidths=[270, 270])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F6FA')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_kpi)
        story.append(Spacer(1, 14))

        # Top return reasons
        story.append(Paragraph("2. Top Return Reasons Analysis", section_style))
        story.append(Spacer(1, 6))
        reason_table_data = [[
            Paragraph("Return Reason", header_style),
            Paragraph("Volume", header_style),
            Paragraph("Share %", header_style),
            Paragraph("Financial Impact", header_style)
        ]]
        for r in data["top_reasons"]:
            reason_table_data.append([
                Paragraph(r["reason"], body_style),
                Paragraph(str(r["count"]), body_style),
                Paragraph(r["share"], body_style),
                Paragraph(r["cost"], body_style)
            ])
        t_reason = Table(reason_table_data, colWidths=[200, 100, 100, 140])
        t_reason.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#24344D')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_reason)
        story.append(Spacer(1, 14))

        # Regional table
        story.append(Paragraph("3. Regional Returns Benchmark", section_style))
        story.append(Spacer(1, 6))
        reg_table_data = [[
            Paragraph("State", header_style),
            Paragraph("Orders", header_style),
            Paragraph("Returns", header_style),
            Paragraph("Return Rate", header_style),
            Paragraph("Total Impact", header_style)
        ]]
        for reg in data["top_regions"]:
            reg_table_data.append([
                Paragraph(reg["state"], body_style),
                Paragraph(str(reg["orders"]), body_style),
                Paragraph(str(reg["returns"]), body_style),
                Paragraph(reg["return_rate"], body_style),
                Paragraph(reg["impact"], body_style)
            ])
        t_reg = Table(reg_table_data, colWidths=[160, 90, 90, 100, 100])
        t_reg.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#24344D')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_reg)

    elif report_type == "product":
        story.append(Paragraph("Product Return Velocity & Risk Registry", section_style))
        story.append(Spacer(1, 6))
        prod_table_data = [[
            Paragraph("Code", header_style),
            Paragraph("Product Name", header_style),
            Paragraph("Category", header_style),
            Paragraph("Orders", header_style),
            Paragraph("Returns", header_style),
            Paragraph("Rate", header_style),
            Paragraph("Risk", header_style)
        ]]
        for p in data["products"][:25]:
            prod_table_data.append([
                Paragraph(p["code"], body_style),
                Paragraph(p["name"][:25], body_style),
                Paragraph(p["category"][:18], body_style),
                Paragraph(str(p["orders"]), body_style),
                Paragraph(str(p["returns"]), body_style),
                Paragraph(p["return_rate"], body_style),
                Paragraph(p["risk_tier"], body_style)
            ])
        t_p = Table(prod_table_data, colWidths=[70, 160, 110, 50, 50, 50, 50])
        t_p.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#24344D')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_p)

    else:
        story.append(Paragraph("Regional Logistics & Return Summary", section_style))
        story.append(Spacer(1, 6))
        reg_table_data = [[
            Paragraph("State", header_style),
            Paragraph("Region", header_style),
            Paragraph("Orders", header_style),
            Paragraph("Returns", header_style),
            Paragraph("Return Rate", header_style),
            Paragraph("Impact", header_style)
        ]]
        for r in data["regions"][:25]:
            reg_table_data.append([
                Paragraph(r["state"], body_style),
                Paragraph(r["region"], body_style),
                Paragraph(str(r["orders"]), body_style),
                Paragraph(str(r["returns"]), body_style),
                Paragraph(r["return_rate"], body_style),
                Paragraph(r["impact"], body_style)
            ])
        t_reg = Table(reg_table_data, colWidths=[120, 90, 80, 80, 80, 90])
        t_reg.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#24344D')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DFE6EF')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_reg)

    # Footer note
    story.append(Spacer(1, 14))
    story.append(Paragraph("Confidential &bull; Generated by RETURVEX Workstation &bull; All calculations verified via database audit logs.", subtitle_style))

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()

    filename = f"returvex_{report_type}_report_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
