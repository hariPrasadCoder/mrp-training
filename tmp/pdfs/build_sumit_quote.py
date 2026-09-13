from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import simpleSplit
import os


OUT = "output/pdf/sumit-ai-engineering-coaching-quote.pdf"
W, H = 720, 1152

INK = HexColor("#0A0A0A")
PAPER = HexColor("#F7F3EA")
DOT = HexColor("#D8D1C4")
PINK = HexColor("#DB8BB8")
BLUE = HexColor("#87C4E2")
GREEN = HexColor("#A6D97D")
YELLOW = HexColor("#F9D36D")
MUTED = HexColor("#5C5A55")
WHITE = HexColor("#FFFDFC")

FONT_REG = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_DISPLAY = "Helvetica-Bold"


def register_fonts():
    global FONT_REG, FONT_BOLD, FONT_DISPLAY
    regular = "/System/Library/Fonts/Supplemental/Arial.ttf"
    bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    display = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
    if os.path.exists(regular):
        pdfmetrics.registerFont(TTFont("MRP-Regular", regular))
        FONT_REG = "MRP-Regular"
    if os.path.exists(bold):
        pdfmetrics.registerFont(TTFont("MRP-Bold", bold))
        FONT_BOLD = "MRP-Bold"
    if os.path.exists(display):
        pdfmetrics.registerFont(TTFont("MRP-Display", display))
        FONT_DISPLAY = "MRP-Display"


def rounded_box(c, x, y, w, h, fill, radius=12, stroke=INK, sw=2.2, shadow=True):
    if shadow:
        c.setFillColor(INK)
        c.roundRect(x + 5, y - 6, w, h, radius, stroke=0, fill=1)
    c.setLineWidth(sw)
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def dotted_background(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(DOT)
    for x in range(14, int(W), 11):
        for y in range(12, int(H), 11):
            c.circle(x, y, 0.65, stroke=0, fill=1)


def logo(c, x, y):
    size = 11
    gap = 3
    colors = [PINK, BLUE, GREEN, YELLOW]
    for i, col in enumerate(colors):
        dx = (i % 2) * (size + gap)
        dy = (1 - i // 2) * (size + gap)
        c.setFillColor(col)
        c.setStrokeColor(INK)
        c.setLineWidth(1.6)
        c.saveState()
        c.translate(x + dx, y + dy)
        c.rotate(5 if i in (0, 3) else -4)
        c.rect(0, 0, size, size, stroke=1, fill=1)
        c.restoreState()
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 11)
    c.drawString(x + 36, y + 17, "MY REAL")
    c.drawString(x + 36, y + 6, "PRODUCT")


def pill(c, x, y, text, fill=YELLOW, size=10):
    pad = 11
    tw = stringWidth(text, FONT_BOLD, size)
    w = tw + pad * 2
    h = 25
    c.setFillColor(INK)
    c.roundRect(x + 4, y - 4, w, h, 7, stroke=0, fill=1)
    c.setFillColor(fill)
    c.setStrokeColor(INK)
    c.setLineWidth(1.8)
    c.roundRect(x, y, w, h, 7, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, size)
    c.drawCentredString(x + w / 2, y + 7.3, text)
    return w


def draw_wrapped(c, text, x, y, width, font=FONT_REG, size=10, leading=13, color=INK, max_lines=None):
    c.setFillColor(color)
    c.setFont(font, size)
    lines = simpleSplit(text, font, size, width)
    if max_lines:
        lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def check_item(c, x, y, text, width, color=GREEN, size=9.2):
    c.setFillColor(color)
    c.setStrokeColor(INK)
    c.setLineWidth(1.1)
    c.circle(x + 4.5, y + 3.8, 4.5, stroke=1, fill=1)
    c.setStrokeColor(INK)
    c.setLineWidth(1.2)
    c.line(x + 2.1, y + 3.7, x + 4.0, y + 1.8)
    c.line(x + 4.0, y + 1.8, x + 7.1, y + 6.1)
    return draw_wrapped(c, text, x + 15, y, width - 15, FONT_REG, size, 12.5)


def footer(c, page_no):
    c.setStrokeColor(INK)
    c.setLineWidth(2)
    c.line(26, 40, W - 26, 40)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(28, 25, "MYREALPRODUCT  /  PRIVATE COACHING PROPOSAL")
    c.drawRightString(W - 28, 25, f"PAGE {page_no} OF 3")


def page_one(c):
    dotted_background(c)
    logo(c, 29, H - 62)
    pill(c, W - 119, H - 63, "HI, SUMIT.")

    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 42)
    c.drawString(29, H - 126, "AI ENGINEERING")
    c.drawString(29, H - 169, "COACHING OPTIONS")
    draw_wrapped(
        c,
        "Choose the learning path that matches the depth of guidance you want. Both options are delivered one-to-one and lead to one demonstrable AI product.",
        31, H - 198, 455, FONT_BOLD, 10.2, 14, MUTED,
    )
    rounded_box(c, 514, H - 214, 174, 82, PINK, radius=10)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 17)
    c.drawString(528, H - 159, "4 WEEKS. 1:1.")
    c.setFont(FONT_BOLD, 9)
    c.drawString(528, H - 177, "BUILD. REVIEW. SHIP.")
    draw_wrapped(c, "A focused engagement built around one capstone.", 528, H - 194, 145, FONT_REG, 8.5, 11)

    c.setStrokeColor(INK)
    c.setLineWidth(2.2)
    c.line(29, H - 232, W - 29, H - 232)

    # Intermediate card
    x1, x2 = 29, 371
    y, cw, ch = 319, 320, 565
    rounded_box(c, x1, y, cw, ch, WHITE, radius=13)
    c.setFillColor(BLUE)
    c.roundRect(x1, y + ch - 116, cw, 116, 13, stroke=0, fill=1)
    c.rect(x1, y + ch - 116, cw, 20, stroke=0, fill=1)
    c.setStrokeColor(INK)
    c.setLineWidth(2.2)
    c.line(x1, y + ch - 116, x1 + cw, y + ch - 116)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(x1 + 17, y + ch - 24, "OPTION 01  /  INTERMEDIATE")
    c.setFont(FONT_DISPLAY, 23)
    c.drawString(x1 + 17, y + ch - 52, "AI PRODUCT BUILDER")
    c.setFont(FONT_DISPLAY, 29)
    c.drawString(x1 + 17, y + ch - 88, "$2,000")
    c.setFont(FONT_BOLD, 8.5)
    c.drawRightString(x1 + cw - 18, y + ch - 84, "4-WEEK PROGRAMME")

    cy = y + ch - 143
    c.setFont(FONT_BOLD, 9)
    c.drawString(x1 + 17, cy, "THE PROVEN ONE-TO-ONE BUILD PATH")
    cy -= 22
    items = [
        "Four weekly Saturday coaching sessions",
        "Weekly one-to-one office hours",
        "Recorded lessons and implementation resources",
        "Build an AI app, add RAG, create a LangGraph agent",
        "Add evaluations, observability and production checks",
        "One production-oriented capstone and final review",
        "Intermediate MyRealProduct curriculum and sequence",
    ]
    for item in items:
        cy = check_item(c, x1 + 17, cy, item, cw - 34, BLUE)
        cy -= 9
    c.setFillColor(HexColor("#E7F4FA"))
    c.setStrokeColor(INK)
    c.setLineWidth(1.5)
    c.roundRect(x1 + 16, y + 20, cw - 32, 78, 8, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(x1 + 28, y + 77, "BEST FOR")
    draw_wrapped(c, "A structured journey through the complete AI product lifecycle.", x1 + 28, y + 59, cw - 56, FONT_BOLD, 9.2, 13)

    # Advanced card
    rounded_box(c, x2, y, cw, ch, WHITE, radius=13)
    c.setFillColor(PINK)
    c.roundRect(x2, y + ch - 116, cw, 116, 13, stroke=0, fill=1)
    c.rect(x2, y + ch - 116, cw, 20, stroke=0, fill=1)
    c.setStrokeColor(INK)
    c.setLineWidth(2.2)
    c.line(x2, y + ch - 116, x2 + cw, y + ch - 116)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(x2 + 17, y + ch - 24, "OPTION 02  /  ADVANCED")
    c.setFont(FONT_DISPLAY, 22)
    c.drawString(x2 + 17, y + ch - 52, "ADVANCED AI ENGINEERING")
    c.setFont(FONT_DISPLAY, 29)
    c.drawString(x2 + 17, y + ch - 88, "$3,000")
    c.setFont(FONT_BOLD, 8.5)
    c.drawRightString(x2 + cw - 18, y + ch - 84, "RECOMMENDED")

    cy = y + ch - 143
    c.setFont(FONT_BOLD, 9)
    c.drawString(x2 + 17, cy, "EVERYTHING IN OPTION 01, PLUS")
    cy -= 22
    items = [
        "The same core curriculum and recorded lessons as Option 01",
        "Three additional 60-minute advanced sessions",
        "Advanced RAG, retrieval evaluation and reranking",
        "Advanced LangGraph and reliable agent architecture",
        "Production AI engineering, evaluations and LLMOps",
        "Curated technical references and next-step roadmap",
        "Deeper architecture and code feedback on your capstone",
    ]
    for item in items:
        cy = check_item(c, x2 + 17, cy, item, cw - 34, PINK)
        cy -= 9
    c.setFillColor(HexColor("#F7E6F0"))
    c.setStrokeColor(INK)
    c.setLineWidth(1.5)
    c.roundRect(x2 + 16, y + 20, cw - 32, 78, 8, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 8)
    c.drawString(x2 + 28, y + 77, "BEST FOR")
    draw_wrapped(c, "An experienced data professional ready to self-build with senior guidance.", x2 + 28, y + 59, cw - 56, FONT_BOLD, 9.2, 13)

    rounded_box(c, 29, 196, W - 58, 91, YELLOW, radius=11)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 18)
    c.drawString(46, 257, "OUR RECOMMENDATION")
    draw_wrapped(
        c,
        "Based on your existing RAG and agent experience, Option 02 lets you move selectively through familiar foundations and adds coaching depth where it matters: retrieval quality, LangGraph architecture and production reliability.",
        46, 237, W - 92, FONT_BOLD, 9.5, 13,
    )
    footer(c, 1)
    c.showPage()


def week_card(c, x, y, number, title, subtitle, body, fill, advanced=None):
    w, h = 319, 153
    rounded_box(c, x, y, w, h, WHITE, radius=11)
    c.setFillColor(fill)
    c.setStrokeColor(INK)
    c.setLineWidth(1.7)
    c.circle(x + 34, y + h - 34, 20, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 19)
    c.drawCentredString(x + 34, y + h - 41, f"0{number}")
    c.setFont(FONT_BOLD, 7)
    c.drawString(x + 63, y + h - 22, subtitle.upper())
    c.setFont(FONT_DISPLAY, 17)
    c.drawString(x + 63, y + h - 43, title.upper())
    draw_wrapped(c, body, x + 17, y + h - 71, w - 34, FONT_REG, 8.7, 11.5)
    if advanced:
        c.setFillColor(fill)
        c.setStrokeColor(INK)
        c.setLineWidth(1.2)
        c.roundRect(x + 16, y + 14, w - 32, 30, 6, stroke=1, fill=1)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 7.5)
        c.drawString(x + 26, y + 25, "ADVANCED SESSION")
        c.setFont(FONT_BOLD, 8.2)
        c.drawRightString(x + w - 25, y + 25, advanced)


def phase_badge(c, x, y, label, fill):
    c.setFillColor(fill)
    c.setStrokeColor(INK)
    c.setLineWidth(0.9)
    c.roundRect(x, y - 2, 38, 14, 3, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 5.6)
    c.drawCentredString(x + 19, y + 2.1, label.upper())


def compact_week_card(c, x, y, number, kicker, title, outcome, topics, rows, fill, advanced_label=None):
    w, h = 319, 344
    rounded_box(c, x, y, w, h, WHITE, radius=11)
    header_h = 83
    c.setFillColor(fill)
    c.roundRect(x, y + h - header_h, w, header_h, 11, stroke=0, fill=1)
    c.rect(x, y + h - header_h, w, 14, stroke=0, fill=1)
    c.setStrokeColor(INK)
    c.setLineWidth(1.8)
    c.line(x, y + h - header_h, x + w, y + h - header_h)
    c.setFillColor(WHITE)
    c.setStrokeColor(INK)
    c.setLineWidth(1.6)
    c.circle(x + 34, y + h - 41, 22, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 19)
    c.drawCentredString(x + 34, y + h - 48, f"0{number}")
    c.setFont(FONT_BOLD, 6.5)
    c.drawString(x + 64, y + h - 23, kicker.upper())
    c.setFont(FONT_DISPLAY, 17)
    c.drawString(x + 64, y + h - 43, title.upper())
    c.setFont(FONT_BOLD, 7.3)
    c.drawString(x + 64, y + h - 61, f"Outcome: {outcome}")

    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 6.6)
    c.drawString(x + 14, y + h - 103, "LEARN / FOCUS")
    topic_text = "  |  ".join(topics)
    draw_wrapped(c, topic_text, x + 14, y + h - 119, w - 28, FONT_REG, 7.4, 10)

    if advanced_label:
        c.setFillColor(fill)
        c.setStrokeColor(INK)
        c.setLineWidth(1)
        c.roundRect(x + 14, y + h - 157, w - 28, 20, 4, stroke=1, fill=1)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 6.4)
        c.drawString(x + 22, y + h - 149, "EXTRA 60-MINUTE SESSION")
        c.drawRightString(x + w - 22, y + h - 149, advanced_label.upper())
        rows_top = y + h - 176
    else:
        rows_top = y + h - 151

    row_gap = 27 if not advanced_label else 24
    for idx, (phase, day, text, badge_fill) in enumerate(rows):
        ry = rows_top - idx * row_gap
        if idx:
            c.setStrokeColor(HexColor("#A9A59D"))
            c.setLineWidth(0.55)
            c.line(x + 14, ry + 16, x + w - 14, ry + 16)
        phase_badge(c, x + 14, ry, phase, badge_fill)
        c.setFillColor(INK)
        c.setFont(FONT_BOLD, 6.5)
        c.drawString(x + 59, ry + 2, day.upper())
        draw_wrapped(c, text, x + 111, ry + 7, w - 126, FONT_REG, 6.6, 8.2, INK, max_lines=2)


def page_two(c):
    dotted_background(c)
    logo(c, 29, H - 62)
    pill(c, W - 176, H - 63, "OPTION 01  /  $2,000", fill=BLUE, size=9)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 36)
    c.drawString(29, H - 121, "INTERMEDIATE TRAINING PLAN")
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(MUTED)
    c.drawString(31, H - 144, "THE PROVEN FOUR-WEEK, ONE-TO-ONE AI PRODUCT BUILDER PROGRAMME.")
    c.setStrokeColor(INK)
    c.setLineWidth(2.2)
    c.line(29, H - 162, W - 29, H - 162)

    rounded_box(c, 29, 891, W - 58, 67, WHITE, radius=10)
    c.setFillColor(BLUE)
    c.rect(29, 891, 96, 67, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 14)
    c.drawString(43, 934, "BEFORE WE START")
    c.setFont(FONT_DISPLAY, 24)
    c.drawString(43, 906, "WEEK 0")
    c.setFont(FONT_BOLD, 8)
    c.drawString(143, 930, "Join the WhatsApp group  /  Pick and understand a problem statement")
    c.drawString(143, 912, "Research existing solutions  /  Submit your understanding report  /  Set up Python, Claude Code and GitHub")

    intermediate_cards = [
        (29, 519, 1, "Foundation", "Ship your AI app", "working MVP at a live URL", ["Claude Code", "LangChain", "GitHub", "FastAPI", "Supabase", "Vercel"], [
            ("Plan", "Saturday", "Intro, solution, MVP, flowchart, Q&A and timeline.", YELLOW),
            ("Learn", "Sunday", "Learn Claude Code, FastAPI and LangChain.", PINK),
            ("Learn", "Monday", "Learn Supabase, GitHub and Vercel; see the full stack fit together.", PINK),
            ("Coach", "Tuesday", "Ideate the build, agree scope and architecture, unblock questions.", BLUE),
            ("Build", "Wednesday", "Scaffold the app, API and first model flow.", GREEN),
            ("Build", "Thursday", "Connect data, frontend and core product flow.", GREEN),
            ("Build", "Friday", "Build, deploy and submit by end of day.", GREEN),
        ], PINK),
        (371, 519, 2, "Knowledge", "Ground it with RAG", "answers from trusted source data", ["Intro to RAG", "Pinecone", "Advanced RAG", "Vector stores", "Types of RAG"], [
            ("Plan", "Saturday", "RAG architecture, sources, retrieval quality, MVP upgrade and Q&A.", YELLOW),
            ("Learn", "Sunday", "Learn RAG foundations, embeddings, chunking and vector stores.", PINK),
            ("Learn", "Monday", "Learn Pinecone, RAG patterns and advanced retrieval through a guided build.", PINK),
            ("Coach", "Tuesday", "Choose sources, chunking strategy, metadata and retrieval approach.", BLUE),
            ("Build", "Wednesday", "Build document ingestion, chunking and vector indexing.", GREEN),
            ("Build", "Thursday", "Build retrieval, grounded generation and citations.", GREEN),
            ("Build", "Friday", "Test retrieval quality, improve weak answers and submit.", GREEN),
        ], BLUE),
        (29, 151, 3, "Action", "Add an AI agent", "a reliable multi-step workflow", ["AI agents", "Tools", "Advanced LangGraph", "LangGraph", "Graph patterns"], [
            ("Plan", "Saturday", "Agent goal, workflow, state, tools, safety boundaries and success criteria.", YELLOW),
            ("Learn", "Sunday", "Learn agent foundations, LangGraph basics and tool calling.", PINK),
            ("Learn", "Monday", "Learn graph patterns and advanced LangGraph through a guided workflow.", PINK),
            ("Coach", "Tuesday", "Map nodes, state, routing, tools and human approval points.", BLUE),
            ("Build", "Wednesday", "Create the graph, state and first working path.", GREEN),
            ("Build", "Thursday", "Add tools, routing, memory and failure handling.", GREEN),
            ("Build", "Friday", "Test complete workflows, record evidence and submit.", GREEN),
        ], GREEN),
        (371, 151, 4, "Production", "Make it reliable", "a monitored, evaluated release", ["Observability", "Evaluations", "LLMOps", "Langfuse/LangSmith", "LiteLLM"], [
            ("Plan", "Saturday", "Production readiness, traces, eval criteria, cost, latency and demo plan.", YELLOW),
            ("Learn", "Sunday", "Learn observability with Langfuse/LangSmith and practical evaluations.", PINK),
            ("Learn", "Monday", "Learn LiteLLM, prompt caching and prompt versioning through a build.", PINK),
            ("Coach", "Tuesday", "Define eval set, tracing plan, gateway setup and release checklist.", BLUE),
            ("Build", "Wednesday", "Instrument traces, metrics and production logs.", GREEN),
            ("Build", "Thursday", "Add evals, gateway, caching and prompt versions.", GREEN),
            ("Build", "Friday", "Submit live app, GitHub repo, demo, results and reflection.", GREEN),
        ], YELLOW),
    ]
    for args in intermediate_cards:
        compact_week_card(c, *args)
    footer(c, 2)
    c.showPage()


def advanced_addon_card(c, y, number, title, core_lessons, addition, details, fill, has_extra=True):
    x, w, h = 29, W - 58, 132
    rounded_box(c, x, y, w, h, WHITE, radius=10)
    c.setFillColor(fill)
    c.roundRect(x, y, 100, h, 10, stroke=0, fill=1)
    c.rect(x + 88, y, 12, h, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 14)
    c.drawString(x + 17, y + h - 27, f"WEEK 0{number}")
    c.setFont(FONT_DISPLAY, 18)
    for idx, line in enumerate(simpleSplit(title.upper(), FONT_DISPLAY, 18, 70)[:2]):
        c.drawString(x + 17, y + h - 52 - idx * 19, line)

    c.setFont(FONT_BOLD, 7)
    c.drawString(x + 119, y + h - 25, "CORE RECORDED LESSONS - SAME AS OPTION 01")
    draw_wrapped(c, core_lessons, x + 119, y + h - 43, 270, FONT_REG, 8.2, 11)

    right_x = x + 410
    c.setFillColor(fill if has_extra else HexColor("#E9E5DC"))
    c.setStrokeColor(INK)
    c.setLineWidth(1.1)
    c.roundRect(right_x, y + 18, 230, h - 36, 7, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont(FONT_BOLD, 7)
    c.drawString(right_x + 13, y + h - 38, "ADVANCED COACHING ADDITION" if has_extra else "HOW THIS WEEK WORKS")
    c.setFont(FONT_DISPLAY, 14)
    c.drawString(right_x + 13, y + h - 58, addition.upper())
    draw_wrapped(c, details, right_x + 13, y + h - 76, 204, FONT_REG, 7.6, 10)


def page_three(c):
    dotted_background(c)
    logo(c, 29, H - 62)
    pill(c, W - 176, H - 63, "OPTION 02  /  $3,000", fill=PINK, size=9)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 36)
    c.drawString(29, H - 121, "ADVANCED COACHING ADD-ON")
    c.setFont(FONT_BOLD, 10)
    c.setFillColor(MUTED)
    c.drawString(31, H - 144, "THE SAME TRAINING PLAN AND RECORDED LESSONS. MORE DEPTH IN COACHING.")
    c.setStrokeColor(INK)
    c.setLineWidth(2.2)
    c.line(29, H - 162, W - 29, H - 162)

    rounded_box(c, 29, 888, W - 58, 77, PINK, radius=10)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 17)
    c.drawString(46, 937, "WHAT THE EXTRA $1,000 ADDS")
    draw_wrapped(c, "Three additional 60-minute one-to-one coaching sessions, selected advanced references, and deeper feedback as you apply those concepts to your own capstone. No separate library of advanced recorded lessons is promised.", 46, 916, W - 92, FONT_BOLD, 8.8, 11.5)

    advanced_addon_card(
        c, 731, 1, "Ship your AI app",
        "Claude Code, LangChain, GitHub, FastAPI, Supabase and Vercel.",
        "Intermediate coaching",
        "Use the normal Saturday session and Tuesday office hours. Familiar material may be reviewed selectively, but the core programme remains unchanged.",
        BLUE, False,
    )
    advanced_addon_card(
        c, 579, 2, "Ground it with RAG",
        "Intro to RAG, Pinecone, Advanced RAG, Vector stores and Types of RAG.",
        "+ 60-minute deep dive",
        "Advanced retrieval choices, hybrid search, query transformation, reranking and how to evaluate retrieval quality in the capstone.",
        PINK, True,
    )
    advanced_addon_card(
        c, 427, 3, "Add an AI agent",
        "AI agents, Tools, Advanced LangGraph, LangGraph and Graph patterns.",
        "+ 60-minute deep dive",
        "LangGraph architecture, state and routing, retries, fallbacks, memory and human approval - applied as coaching, not a bespoke recorded course.",
        GREEN, True,
    )
    advanced_addon_card(
        c, 275, 4, "Make it reliable",
        "Observability, Evaluations, LLMOps, Langfuse/LangSmith and LiteLLM.",
        "+ 60-minute deep dive",
        "Evaluation strategy, tracing, prompt and model versioning, cost, latency and a production-readiness review of the capstone.",
        YELLOW, True,
    )

    rounded_box(c, 29, 84, W - 58, 157, WHITE, radius=10)
    c.setFillColor(BLUE)
    c.rect(29, 206, 319, 35, stroke=0, fill=1)
    c.setFillColor(PINK)
    c.rect(348, 206, 343, 35, stroke=0, fill=1)
    c.setStrokeColor(INK)
    c.setLineWidth(1.4)
    c.line(348, 84, 348, 241)
    c.setFillColor(INK)
    c.setFont(FONT_DISPLAY, 14)
    c.drawString(45, 216, "INCLUDED IN OPTION 02")
    c.drawString(364, 216, "NOT INCLUDED")
    left_items = [
        "Three extra private coaching sessions",
        "Curated references for the three deep dives",
        "Deeper architecture and code feedback",
        "Priorities adapted to Sumit's existing knowledge",
    ]
    right_items = [
        "A separate advanced recorded curriculum",
        "A bespoke course created for one participant",
        "Extended pair-programming or live implementation",
        "Code written on the participant's behalf",
    ]
    cy = 184
    for item in left_items:
        cy = check_item(c, 45, cy, item, 285, BLUE, 7.7)
        cy -= 5
    cy = 184
    for item in right_items:
        cy = check_item(c, 364, cy, item, 310, PINK, 7.7)
        cy -= 5
    footer(c, 3)
    c.showPage()


def main():
    register_fonts()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=(W, H), pageCompression=1)
    c.setTitle("Sumit - AI Engineering Coaching Quote")
    c.setAuthor("MyRealProduct")
    c.setSubject("Four-week one-to-one AI engineering coaching quote and training plans")
    page_one(c)
    page_two(c)
    page_three(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()
