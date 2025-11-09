#!/usr/bin/env python3
"""
Automated documentation generator for the Real Estate Management System.

This script parses the NestJS backend and Next.js frontend to build detailed
bilingual documentation artefacts:
  - Software Requirements Specification (SRS)
  - Architecture Design Document (ADD)
  - Change Implementation Plan (CIP)
  - Strategic Vision & Roadmap
  - Codebase Deep Dive

The output is emitted under `Project_Documentation/EN` and
`Project_Documentation/AR` with mirrored structure. Each English document has
an Arabic counterpart suffixed with `_AR.md`.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
API_SRC = ROOT / "api" / "src"
WEB_SRC = ROOT / "Web" / "src"
DOC_EN = ROOT / "Project_Documentation" / "EN"
DOC_AR = ROOT / "Project_Documentation" / "AR"


# --------------------------------------------------------------------------- #
# Data models
# --------------------------------------------------------------------------- #


@dataclass
class MethodMeta:
    name: str
    params: str
    decorators: List[str]
    http_method: Optional[str]
    route: Optional[str]
    roles: List[str]
    signature: str
    start_line: int
    end_line: int
    snippet: str


@dataclass
class ControllerMeta:
    file: Path
    controller_name: str
    base: Optional[str]
    methods: List[MethodMeta]
    injected: List[Tuple[str, str]]  # list of (property, type)


@dataclass
class ServiceMethodMeta:
    name: str
    params: str
    start_line: int
    end_line: int
    snippet: str


@dataclass
class ServiceMeta:
    file: Path
    class_name: str
    accessors: List[Tuple[str, str]]  # constructor injections (property, type)
    methods: List[ServiceMethodMeta]


@dataclass
class DtoPropertyMeta:
    name: str
    type_annotation: str
    decorators: List[str]


@dataclass
class DtoClassMeta:
    class_name: str
    properties: List[DtoPropertyMeta]


@dataclass
class DtoFileMeta:
    file: Path
    classes: List[DtoClassMeta]


@dataclass
class FrontendExport:
    name: str
    kind: str
    signature: str
    start_line: int
    end_line: int
    snippet: str


@dataclass
class FrontendFileMeta:
    file: Path
    exports: List[FrontendExport]


@dataclass
class ModuleMeta:
    key: str
    controllers: List[ControllerMeta] = field(default_factory=list)
    services: List[ServiceMeta] = field(default_factory=list)
    dtos: List[DtoFileMeta] = field(default_factory=list)
    frontend: List[FrontendFileMeta] = field(default_factory=list)


# --------------------------------------------------------------------------- #
# Parsing utilities
# --------------------------------------------------------------------------- #


def _strip_wrapping_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] in {"'", '"', "`"} and value[-1] == value[0]:
        return value[1:-1]
    return value


def parse_controllers() -> List[ControllerMeta]:
    controllers: List[ControllerMeta] = []
    for path in sorted(API_SRC.rglob("*controller.ts")):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()

        class_match = re.search(r"class\s+(\w+)\s+{", text)
        controller_name = class_match.group(1) if class_match else path.stem.title()

        base_match = re.search(r"@Controller\(([^)]*)\)", text)
        base = _strip_wrapping_quotes(base_match.group(1)) if base_match else None

        methods: List[MethodMeta] = []
        decorators: List[str] = []

        for idx, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith("@"):
                decorators.append(stripped)
                continue

            method_match = re.match(
                r"(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\((.*)\)\s*{", stripped
            )
            if method_match and decorators:
                method_name = method_match.group(1)
                params = method_match.group(2)

                http_method = None
                route = None
                roles: List[str] = []
                for deco in decorators:
                    http_match = re.match(r"@(Get|Post|Patch|Put|Delete|Options|Head)\(([^)]*)\)", deco)
                    if http_match:
                        http_method = http_match.group(1)
                        route = _strip_wrapping_quotes(http_match.group(2))
                    roles_match = re.match(r"@Roles\(([^)]*)\)", deco)
                    if roles_match:
                        role_vals = [val.strip() for val in roles_match.group(1).split(",") if val.strip()]
                        roles = [_strip_wrapping_quotes(val) for val in role_vals]

                signature = stripped
                method_lines = [line]
                brace_count = line.count("{") - line.count("}")
                cursor = idx + 1
                while brace_count > 0 and cursor < len(lines):
                    method_lines.append(lines[cursor])
                    brace_count += lines[cursor].count("{") - lines[cursor].count("}")
                    cursor += 1
                methods.append(
                    MethodMeta(
                        name=method_name,
                        params=params,
                        decorators=list(decorators),
                        http_method=http_method,
                        route=route,
                        roles=roles,
                        signature=signature,
                        start_line=idx + 1,
                        end_line=cursor,
                        snippet="\n".join(method_lines[:18]),
                    )
                )
                decorators = []
            elif stripped:
                decorators = []

        injected: List[Tuple[str, str]] = []
        ctor_match = re.search(r"constructor\(([^)]*)\)", text)
        if ctor_match:
            for segment in ctor_match.group(1).split(","):
                segment = segment.strip()
                if not segment:
                    continue
                match = re.match(
                    r"(?:private|public|protected)?\s*(?:readonly\s+)?(\w+)\s*:\s*(\w+)", segment
                )
                if match:
                    injected.append((match.group(1), match.group(2)))

        controllers.append(
            ControllerMeta(
                file=path,
                controller_name=controller_name,
                base=base,
                methods=methods,
                injected=injected,
            )
        )
    return controllers


def parse_services() -> List[ServiceMeta]:
    services: List[ServiceMeta] = []
    invalid = {"if", "for", "while", "switch", "catch", "else"}

    for path in sorted(API_SRC.rglob("*service.ts")):
        if path.name.endswith(".backup"):
            continue
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()

        class_match = re.search(r"class\s+(\w+)\s+{", text)
        class_name = class_match.group(1) if class_match else path.stem.title()

        accessor_pairs: List[Tuple[str, str]] = []
        ctor_match = re.search(r"constructor\(([^)]*)\)", text)
        if ctor_match:
            for segment in ctor_match.group(1).split(","):
                segment = segment.strip()
                if not segment:
                    continue
                match = re.match(
                    r"(?:private|public|protected)?\s*(?:readonly\s+)?(\w+)\s*:\s*(\w+)", segment
                )
                if match:
                    accessor_pairs.append((match.group(1), match.group(2)))

        methods: List[ServiceMethodMeta] = []
        for idx, line in enumerate(lines):
            stripped = line.strip()
            method_match = re.match(
                r"(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\((.*)\)\s*{", stripped
            )
            if not method_match:
                continue
            name = method_match.group(1)
            if name in invalid or name == "constructor":
                continue
            params = method_match.group(2)
            method_lines = [line]
            brace_count = line.count("{") - line.count("}")
            cursor = idx + 1
            while brace_count > 0 and cursor < len(lines):
                method_lines.append(lines[cursor])
                brace_count += lines[cursor].count("{") - lines[cursor].count("}")
                cursor += 1
            methods.append(
                ServiceMethodMeta(
                    name=name,
                    params=params,
                    start_line=idx + 1,
                    end_line=cursor,
                    snippet="\n".join(method_lines[:22]),
                )
            )

        services.append(
            ServiceMeta(
                file=path,
                class_name=class_name,
                accessors=accessor_pairs,
                methods=methods,
            )
        )
    return services


def parse_dtos() -> List[DtoFileMeta]:
    results: List[DtoFileMeta] = []
    for path in sorted(API_SRC.rglob("*.dto.ts")):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()

        classes: List[DtoClassMeta] = []
        current: Optional[DtoClassMeta] = None
        decorators: List[str] = []

        for raw_line in lines:
            line = raw_line.strip()
            class_match = re.match(r"export\s+class\s+(\w+)", line)
            if class_match:
                current = DtoClassMeta(class_name=class_match.group(1), properties=[])
                classes.append(current)
                decorators = []
                continue
            if current is None:
                continue
            if line.startswith("@"):
                decorators.append(line)
                continue
            prop_match = re.match(r"(?:readonly\s+)?(\w+)\??:\s*([^;]+);", line)
            if prop_match:
                current.properties.append(
                    DtoPropertyMeta(
                        name=prop_match.group(1),
                        type_annotation=prop_match.group(2).strip(),
                        decorators=list(decorators),
                    )
                )
                decorators = []
            elif line:
                decorators = []

        if classes:
            results.append(DtoFileMeta(file=path, classes=classes))
    return results


def parse_frontend() -> List[FrontendFileMeta]:
    exports: List[FrontendFileMeta] = []
    if not WEB_SRC.exists():
        return exports

    export_pattern = re.compile(
        r"(export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)[^{]*{)", re.MULTILINE
    )

    for path in sorted(WEB_SRC.rglob("*.tsx")):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()

        file_exports: List[FrontendExport] = []
        for match in export_pattern.finditer(text):
            signature_line = match.group(1)
            name = match.group(2)
            start_pos = match.start(1)
            start_line = text[:start_pos].count("\n") + 1

            brace_count = signature_line.count("{") - signature_line.count("}")
            snippet_lines = [signature_line]
            cursor = start_line
            while brace_count > 0 and cursor < len(lines):
                snippet_lines.append(lines[cursor])
                brace_count += lines[cursor].count("{") - lines[cursor].count("}")
                cursor += 1
            file_exports.append(
                FrontendExport(
                    name=name,
                    kind="default" if "default" in signature_line else "named",
                    signature=signature_line.strip(),
                    start_line=start_line,
                    end_line=cursor,
                    snippet="\n".join(snippet_lines[:18]),
                )
            )

        if file_exports:
            exports.append(FrontendFileMeta(file=path, exports=file_exports))
    return exports


# --------------------------------------------------------------------------- #
# Helper catalogues
# --------------------------------------------------------------------------- #


def build_modules(
    controllers: List[ControllerMeta],
    services: List[ServiceMeta],
    dtos: List[DtoFileMeta],
    frontends: List[FrontendFileMeta],
) -> Dict[str, ModuleMeta]:
    modules: Dict[str, ModuleMeta] = {}

    def module_key(path: Path) -> str:
        parts = path.relative_to(API_SRC).parts
        if len(parts) >= 2:
            return parts[0]
        return parts[0] if parts else "root"

    for controller in controllers:
        key = module_key(controller.file)
        modules.setdefault(key, ModuleMeta(key=key)).controllers.append(controller)

    for service in services:
        try:
            key = module_key(service.file)
        except ValueError:
            # Service might belong to frontend or external path; skip domain mapping.
            continue
        modules.setdefault(key, ModuleMeta(key=key)).services.append(service)

    for dto in dtos:
        try:
            key = module_key(dto.file)
        except ValueError:
            continue
        modules.setdefault(key, ModuleMeta(key=key)).dtos.append(dto)

    for fe in frontends:
        relative = fe.file.relative_to(WEB_SRC)
        key = relative.parts[0] if len(relative.parts) > 1 else "frontend"
        modules.setdefault(key, ModuleMeta(key=key)).frontend.append(fe)

    return modules


def index_dtos(dtos: List[DtoFileMeta]) -> Dict[str, Tuple[DtoClassMeta, Path]]:
    index: Dict[str, Tuple[DtoClassMeta, Path]] = {}
    for dto in dtos:
        for klass in dto.classes:
            index[klass.class_name] = (klass, dto.file)
    return index


def service_lookup(services: List[ServiceMeta]) -> Dict[str, ServiceMeta]:
    return {service.class_name: service for service in services}


# --------------------------------------------------------------------------- #
# Text helpers and translations
# --------------------------------------------------------------------------- #


DOMAIN_LABELS = {
    "analytics": ("Analytics", "التحليلات"),
    "appointments": ("Appointments", "المواعيد"),
    "auth": ("Authentication", "المصادقة"),
    "common": ("Common Utilities", "الخدمات المشتركة"),
    "customers": ("Customers", "العملاء"),
    "health": ("Health", "الصحة"),
    "integrations": ("Integrations", "التكاملات"),
    "maintenance": ("Maintenance", "الصيانة"),
    "onboarding": ("Onboarding", "التهيئة"),
    "payments": ("Payments", "المدفوعات"),
    "properties": ("Properties", "العقارات"),
    "supabase": ("Supabase Access", "وصول Supabase"),
    "whatsapp": ("WhatsApp", "واتساب"),
    "frontend": ("Frontend Shared", "مكونات الواجهة"),
}


def domain_label(key: str, lang: str) -> str:
    base = DOMAIN_LABELS.get(key, (key.replace("_", " ").title(), key))
    return base[0] if lang == "en" else base[1]


def translate(term: str, lang: str) -> str:
    """
    Lightweight terminology map to keep bilingual text consistent.
    """
    glossary = {
        "Endpoint": "نقطة النهاية",
        "Controller Method": "دالة المتحكم",
        "HTTP Method": "طريقة HTTP",
        "Route": "المسار",
        "Required Roles": "الأدوار المطلوبة",
        "Guards": "الحمايات",
        "Request Parameters": "معاملات الطلب",
        "Response Shape": "بنية الاستجابة",
        "Validation Rules": "قواعد التحقق",
        "Error Handling": "التعامل مع الأخطاء",
        "Observability": "المراقبة",
        "Testing Notes": "ملاحظات الاختبار",
        "Step-by-step Example": "مثال خطوة بخطوة",
        "Service Delegation": "التفويض إلى الخدمة",
    }
    if lang == "en":
        return term
    return glossary.get(term, term)


MODULE_CONTEXT = {
    "analytics": (
        "Aggregates Supabase analytics routines powering dashboards, KPIs, and executive summaries.",
        "يُجمع روتينات التحليلات في Supabase لتغذية لوحات المتابعة ومؤشرات الأداء والتقارير التنفيذية.",
    ),
    "appointments": (
        "Coordinates scheduling, availability verification, and completion workflows for staff appointments.",
        "ينسق جدولة المواعيد والتحقق من التوفر ومسارات الإكمال لمواعيد الموظفين.",
    ),
    "auth": (
        "Provides decorators, guards, and middleware enabling role-based access control across the API.",
        "يوفر الزخارف والحمايات والبرمجيات الوسيطة لتفعيل التحكم بالوصول المعتمد على الأدوار عبر الواجهة البرمجية.",
    ),
    "common": (
        "Hosts shared guards, interceptors, and exception filters to enforce consistent cross-cutting concerns.",
        "يحتضن الحمايات والمقاطعات ومرشحات الاستثناء المشتركة لفرض الجوانب العرضية الموحدة.",
    ),
    "customers": (
        "Delivers CRM capabilities including notes, interactions, property linking, and Excel import/export flows.",
        "يوفر قدرات إدارة علاقات العملاء بما يشمل الملاحظات والتفاعلات وربط العقارات ودفقات الاستيراد/التصدير عبر Excel.",
    ),
    "health": (
        "Exposes readiness and health probes for infrastructure orchestration.",
        "يُظهر فحوصات الجاهزية والصحة لتنظيم البنية التحتية.",
    ),
    "integrations": (
        "Bridges automations (e.g., n8n) and external ecosystems with the core platform.",
        "يربط الأتمتة (مثل n8n) والأنظمة الخارجية مع المنصة الأساسية.",
    ),
    "maintenance": (
        "Tracks maintenance requests, technician workflows, and public intake forms.",
        "يتتبع طلبات الصيانة ومسارات الفنيين ونماذج الإدخال العامة.",
    ),
    "onboarding": (
        "Guides new offices through activation sequences and initial data population.",
        "يرشد المكاتب الجديدة خلال مراحل التفعيل وتعبئة البيانات الأولية.",
    ),
    "payments": (
        "Manages rental payment lifecycle, reminders, and Supabase finance ledger integration.",
        "يدير دورة حياة المدفوعات الإيجارية والتنبيهات ودمج دفتر الحسابات المالي في Supabase.",
    ),
    "properties": (
        "Core property lifecycle management including listing, filtering, media, and public sharing.",
        "يدير دورة حياة العقار بما يشمل الإدراج والتصفية والوسائط والمشاركة العامة.",
    ),
    "supabase": (
        "Wraps Supabase client configuration and reusable query helpers.",
        "يغلف إعدادات عميل Supabase ومساعدات الاستعلام القابلة لإعادة الاستخدام.",
    ),
    "whatsapp": (
        "Integrates with the Meta WhatsApp API for outbound notifications and conversations.",
        "يتكامل مع واجهة WhatsApp التابعة لـ Meta لإرسال الإشعارات والمحادثات.",
    ),
    "frontend": (
        "Next.js pages and components orchestrating dashboard, CRM, and public experiences.",
        "صفحات ومكونات Next.js تدير لوحات التحكم وواجهات CRM والتجارب العامة.",
    ),
}

SCALING_NOTES = {
    "analytics": (
        "Cache expensive dashboard aggregates and consider materialized views for monthly trends.",
        "تخزين مؤقت للتجميعات المكلفة في لوحة التحكم والنظر في المشاهد المادية للاتجاهات الشهرية.",
    ),
    "appointments": (
        "Enforce unique scheduling slots per staff to avoid Supabase conflicts under concurrent booking.",
        "فرض فترات زمنية فريدة لكل موظف لتفادي تعارضات Supabase أثناء الحجز المتوازي.",
    ),
    "customers": (
        "Partition export/import jobs into background queues to shield HTTP latencies.",
        "تقسيم مهام التصدير/الاستيراد إلى طوابير خلفية لحماية زمن استجابة HTTP.",
    ),
    "maintenance": (
        "Scale technician assignment by introducing status indexes and separating public submissions.",
        "توسيع تعيين الفنيين عبر إضافة فهارس للحالات وفصل الطلبات العامة.",
    ),
    "payments": (
        "Guard against double writes by wrapping Supabase updates in transactions once available.",
        "منع الكتابة المزدوجة عبر تغليف تحديثات Supabase ضمن معاملات حالما تصبح متاحة.",
    ),
    "properties": (
        "Introduce read replicas or cached projections for heavy filter combinations in listing feeds.",
        "إدخال نسخ قراءة أو عروض مخزنة مؤقتاً للتعامل مع التصفية الكثيفة في قنوات القوائم.",
    ),
    "whatsapp": (
        "Throttle outbound conversations and persist message state to recover from webhook retries.",
        "تنظيم معدل المحادثات الصادرة وتخزين حالة الرسائل لاستعادة الحالة عند إعادة محاولات الويبهوك.",
    ),
    "frontend": (
        "Adopt incremental static regeneration (ISR) for public pages to offload repeated reads.",
        "اعتماد التجديد الساكن المتزايد (ISR) للصفحات العامة لتخفيف القراءة المتكررة.",
    ),
}


def format_roles(roles: List[str], lang: str) -> str:
    if not roles:
        return "Public (requires JWT context)" if lang == "en" else "متاح للمستخدمين المصادقين عبر JWT"
    if lang == "en":
        return ", ".join(roles)
    mapping = {
        "manager": "مدير",
        "staff": "موظف",
        "accountant": "محاسب",
        "admin": "مسؤول",
    }
    return ", ".join(mapping.get(role, role) for role in roles)


def format_decorators(decorators: List[str]) -> str:
    return ", ".join(decorators)


def indent(text: str, level: int = 2) -> str:
    padding = " " * level
    return "\n".join(f"{padding}{line}" if line else "" for line in text.splitlines())


# --------------------------------------------------------------------------- #
# Document generation helpers
# --------------------------------------------------------------------------- #


class DocumentationBuilder:
    def __init__(self, lang: str):
        self.lang = lang
        self.lines: List[str] = []

    def add(self, text: str = "") -> None:
        self.lines.append(text)

    def add_block(self, text: str) -> None:
        self.lines.extend(text.splitlines())

    def add_code_block(self, snippet: str, language: str = "ts") -> None:
        self.add(f"```{language}")
        self.lines.extend(snippet.rstrip().splitlines())
        self.add("```")

    def extend(self, iterable: List[str]) -> None:
        self.lines.extend(iterable)

    def result(self) -> str:
        return "\n".join(self.lines).rstrip() + "\n"


# --------------------------------------------------------------------------- #
# SRS generation
# --------------------------------------------------------------------------- #


def describe_dto(dto_class: DtoClassMeta, dto_path: Path, lang: str) -> List[str]:
    lines: List[str] = []
    header = (
        f"DTO `{dto_class.class_name}` defined in `{dto_path}`"
        if lang == "en"
        else f"كائن DTO `{dto_class.class_name}` معرف في `{dto_path}`"
    )
    lines.append(header)
    for prop in dto_class.properties:
        decorator_labels = ", ".join(prop.decorators) if prop.decorators else "None" if lang == "en" else "لا يوجد"
        if lang == "en":
            lines.append(
                f"- Field `{prop.name}`: `{prop.type_annotation}` — validators: {decorator_labels}"
            )
        else:
            lines.append(
                f"- الحقل `{prop.name}`: `{prop.type_annotation}` — أدوات التحقق: {decorator_labels}"
            )
    return lines


def endpoint_full_path(controller: ControllerMeta, method: MethodMeta) -> str:
    segments = []
    if controller.base and controller.base not in {"", "/"}:
        segments.append(controller.base.strip("/"))
    if method.route:
        segments.append(method.route.strip("/"))
    path = "/".join(seg for seg in segments if seg)
    return f"/{path}" if path else f"/{controller.base or ''}".rstrip("/") or "/"


def extract_service_calls(method: MethodMeta) -> List[Tuple[str, str]]:
    matches = re.findall(r"this\.(\w+)\.(\w+)\(", method.snippet)
    return matches


def dto_mentions_in_method(method: MethodMeta, dto_names: Iterable[str]) -> List[str]:
    mentions: List[str] = []
    for name in dto_names:
        if re.search(rf"\b{name}\b", method.params):
            mentions.append(name)
    return mentions


def map_dto_usage(
    controllers: List[ControllerMeta], dto_names: Iterable[str]
) -> Dict[str, List[Tuple[ControllerMeta, MethodMeta]]]:
    usage: Dict[str, List[Tuple[ControllerMeta, MethodMeta]]] = {name: [] for name in dto_names}
    patterns = {name: re.compile(rf"\b{name}\b") for name in dto_names}
    for controller in controllers:
        for method in controller.methods:
            for name, pattern in patterns.items():
                if pattern.search(method.params):
                    usage[name].append((controller, method))
    return usage


def generate_srs(
    modules: Dict[str, ModuleMeta],
    dto_index: Dict[str, Tuple[DtoClassMeta, Path]],
    service_index: Dict[str, ServiceMeta],
    lang: str,
) -> str:
    builder = DocumentationBuilder(lang)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    if lang == "en":
        builder.add("# Software Requirements Specification (SRS)")
        builder.add("")
        builder.add(f"- **Project**: Real Estate Management System")
        builder.add(f"- **Document Version**: 2.0")
        builder.add(f"- **Generated**: {now}")
        builder.add(
            "- **Scope**: Comprehensive functional catalogue across backend and frontend touchpoints, "
            "including validation, access control, data flow, and operational scenarios."
        )
    else:
        builder.add("# وثيقة المتطلبات البرمجية (SRS)")
        builder.add("")
        builder.add(" - **المشروع**: نظام إدارة العقارات")
        builder.add(" - **إصدار الوثيقة**: 2.0")
        builder.add(f" - **تاريخ التوليد**: {now}")
        builder.add(
            " - **النطاق**: جرد وظيفي شامل يغطي واجهات البرمجة الخلفية والواجهة الأمامية مع قواعد التحقق والتحكم بالوصول وتدفق البيانات."
        )

    builder.add("")
    builder.add("## Contents" if lang == "en" else "## المحتويات")
    for key in sorted(modules):
        label = domain_label(key, lang)
        builder.add(f"- [{label}](#{label.lower().replace(' ', '-')})")
    builder.add("")

    for key in sorted(modules):
        module = modules[key]
        label = domain_label(key, lang)
        builder.add(f"## {label}")
        builder.add("")

        if lang == "en":
            builder.add(
                f"The `{label}` module aggregates {len(module.controllers)} controller(s), "
                f"{len(module.services)} service(s), and {sum(len(dto.classes) for dto in module.dtos)} "
                f"DTO definitions."
            )
        else:
            builder.add(
                f"تضم وحدة `{label}` عدد {len(module.controllers)} متحكم/متحكمات، "
                f"{len(module.services)} خدمة، و {sum(len(dto.classes) for dto in module.dtos)} تعريفاً لكائنات DTO."
            )

        builder.add("")

        for controller in module.controllers:
            controller_header = (
                f"### Controller `{controller.controller_name}` (`{controller.file}`)"
                if lang == "en"
                else f"### المتحكم `{controller.controller_name}` (`{controller.file}`)"
            )
            builder.add(controller_header)
            if controller.injected:
                if lang == "en":
                    builder.add(
                        "- Injected services: "
                        + ", ".join(f"`{prop}: {service}`" for prop, service in controller.injected)
                    )
                else:
                    builder.add(
                        "- الخدمات المحقونة: "
                        + ", ".join(f"`{prop}: {service}`" for prop, service in controller.injected)
                    )

            if not controller.methods:
                builder.add(
                    "*No HTTP endpoints defined in this controller.*"
                    if lang == "en"
                    else "*لا توجد نقاط نهاية معرفة في هذا المتحكم.*"
                )
                builder.add("")
                continue

            for method in controller.methods:
                http_label = method.http_method or ("Custom" if lang == "en" else "مخصص")
                full_path = endpoint_full_path(controller, method)
                section_title = (
                    f"#### Endpoint: {http_label} `{full_path}`"
                    if lang == "en"
                    else f"#### نقطة النهاية: {http_label} `{full_path}`"
                )
                builder.add(section_title)
                builder.add("")

                controller_line = (
                    f"- **{translate('Controller Method', lang)}**: `{controller.controller_name}.{method.name}()` "
                    f"(lines {method.start_line}-{method.end_line} in `{controller.file}`)"
                )
                builder.add(controller_line)
                builder.add(
                    f"- **{translate('HTTP Method', lang)}**: `{method.http_method or 'N/A'}`"
                )
                builder.add(f"- **{translate('Route', lang)}**: `{full_path}`")
                builder.add(
                    f"- **{translate('Required Roles', lang)}**: {format_roles(method.roles, lang)}"
                )
                builder.add(
                    f"- **{translate('Guards', lang)}**: `{format_decorators(method.decorators)}`"
                )

                builder.add("")
                builder.add(f"**{translate('Request Parameters', lang)}**")
                builder.add("")

                dto_mentions = []
                for dto_name in dto_index:
                    if re.search(rf"\b{dto_name}\b", method.params):
                        dto_mentions.append(dto_name)

                param_lines: List[str] = []
                if not method.params.strip():
                    param_lines.append("- ∅")
                else:
                    params_split = [param.strip() for param in method.params.split(",") if param.strip()]
                    for param in params_split:
                        param_lines.append(f"- `{param}`")
                builder.extend(param_lines)

                builder.add("")
                builder.add(f"**{translate('Validation Rules', lang)}**")
                builder.add("")

                if dto_mentions:
                    for dto_name in dto_mentions:
                        dto_class, dto_path = dto_index[dto_name]
                        builder.extend(describe_dto(dto_class, dto_path, lang))
                else:
                    builder.add("- (Parameters rely on primitive validation)" if lang == "en" else "- (المعاملات تعتمد على التحقق الأساسي)")

                builder.add("")
                builder.add(f"**{translate('Service Delegation', lang)}**")
                builder.add("")

                service_calls = extract_service_calls(method)
                if service_calls:
                    for property_name, service_method in service_calls:
                        service_type = next((stype for prop, stype in controller.injected if prop == property_name), None)
                        if service_type and service_type in service_index:
                            service_meta = service_index[service_type]
                            snippet = next(
                                (m.snippet for m in service_meta.methods if m.name == service_method),
                                "",
                            )
                            if lang == "en":
                                builder.add(
                                    f"- Delegates to `{service_type}.{service_method}` defined in `{service_meta.file}`."
                                )
                            else:
                                builder.add(
                                    f"- يفوض إلى `{service_type}.{service_method}` في `{service_meta.file}`."
                                )
                            if snippet:
                                builder.add_code_block(snippet, language="ts")
                        else:
                            if lang == "en":
                                builder.add(
                                    f"- Calls `{property_name}.{service_method}()` (service definition not resolved automatically)."
                                )
                            else:
                                builder.add(
                                    f"- يستدعي `{property_name}.{service_method}()` (تعذر تحديد موقع الخدمة تلقائياً)."
                                )
                else:
                    builder.add(
                        "- Direct inline logic without delegation."
                        if lang == "en"
                        else "- منطق مباشر داخل المتحكم دون تفويض."
                    )

                builder.add("")
                builder.add(f"**{translate('Step-by-step Example', lang)}**")
                builder.add("")
                if lang == "en":
                    builder.add(
                        "1. Client sends the request with a JWT issued by `AuthService`."
                    )
                    builder.add(
                        "2. `RolesGuard` verifies role membership before invoking the method."
                    )
                    builder.add(
                        "3. The controller extracts the office context from `req.user` and forwards arguments to the domain service."
                    )
                    builder.add(
                        "4. The service executes Supabase queries and returns a normalized payload."
                    )
                else:
                    builder.add("1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.")
                    builder.add("2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.")
                    builder.add("3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.")
                    builder.add("4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.")

                builder.add("")
                builder.add(f"**{translate('Error Handling', lang)}**")
                builder.add("")
                if "UnauthorizedException" in method.snippet:
                    builder.add(
                        "- Throws `UnauthorizedException` when office context is missing."
                        if lang == "en"
                        else "- يرمي `UnauthorizedException` عند غياب هوية المكتب."
                    )
                if "NotFoundException" in method.snippet or "NotFoundException" in method.signature:
                    builder.add(
                        "- Propagates `NotFoundException` to signal missing records."
                        if lang == "en"
                        else "- يمرر `NotFoundException` للدلالة على عدم العثور على السجل."
                    )
                if "BadRequestException" in method.snippet:
                    builder.add(
                        "- Surfaces `BadRequestException` upon validation failures."
                        if lang == "en"
                        else "- يظهر `BadRequestException` عند فشل التحقق."
                    )
                builder.add(
                    "- Service-level errors bubble up and are captured by `GlobalExceptionFilter`."
                    if lang == "en"
                    else "- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`."
                )

                builder.add("")
                builder.add(f"**{translate('Observability', lang)}**")
                builder.add("")
                if lang == "en":
                    builder.add(
                        "- Activity is logged by `ActivityLogInterceptor` ensuring audit trails."
                    )
                    builder.add(
                        "- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement)."
                    )
                else:
                    builder.add(
                        "- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق."
                    )
                    builder.add(
                        "- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي)."
                    )

                builder.add("")
                builder.add(f"**{translate('Testing Notes', lang)}**")
                builder.add("")
                if lang == "en":
                    builder.add(
                        "- Unit-test controller logic with Nest testing utilities by mocking `"
                        + "`, `".join(service for _, service in controller.injected)
                        + "`."
                    )
                    builder.add(
                        "- Use e2e tests to validate JWT guard integration and Supabase interactions."
                    )
                    builder.add(
                        "- Frontend integration should mock API responses using MSW when exercising `/Web/src` components."
                    )
                else:
                    builder.add(
                        "- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات "
                        + "، ".join(service for _, service in controller.injected)
                        + "."
                    )
                    builder.add(
                        "- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase."
                    )
                    builder.add(
                        "- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`."
                    )

                builder.add("")
                builder.add_code_block(method.snippet, language="ts")
                builder.add("")

        builder.add("---")
        builder.add("")

    return builder.result()


# --------------------------------------------------------------------------- #
# ADD generation
# --------------------------------------------------------------------------- #


def generate_add(modules: Dict[str, ModuleMeta], service_index: Dict[str, ServiceMeta], lang: str) -> str:
    builder = DocumentationBuilder(lang)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    if lang == "en":
        builder.add("# Architecture Design Document (ADD)")
        builder.add("")
        builder.add(f"- **Generated**: {now}")
        builder.add(
            "- **Scope**: Captures architectural layers, dependencies, and cross-cutting concerns of the Real Estate Management System."
        )
    else:
        builder.add("# وثيقة تصميم المعمارية (ADD)")
        builder.add("")
        builder.add(f"- **تاريخ التوليد**: {now}")
        builder.add(
            "- **النطاق**: توثق طبقات المعمارية والاعتماديات والجوانب المشتركة في نظام إدارة العقارات."
        )
    builder.add("")

    # System overview
    if lang == "en":
        builder.add("## System Overview")
        builder.add(
            "The solution adopts a modular NestJS backend paired with a Next.js frontend. Supabase "
            "provides database, authentication, and file storage. Domain modules encapsulate bounded contexts "
            "such as Properties, Customers, and Payments."
        )
    else:
        builder.add("## نظرة عامة على النظام")
        builder.add(
            "يعتمد الحل على واجهة خلفية مبنية بـ NestJS وواجهة أمامية مبنية بـ Next.js مع اعتماد Supabase "
            "كمخدم قاعدة بيانات ومصادقة وتخزين ملفات. تُغلف الوحدات المجالات المحددة مثل العقارات والعملاء والمدفوعات."
        )
    builder.add("")

    # Backend architecture per module
    for key in sorted(modules):
        module = modules[key]
        label = domain_label(key, lang)
        builder.add(f"## {label} Module Architecture")
        builder.add("")

        builder.add(
            f"- Controllers: {len(module.controllers)}"
            if lang == "en"
            else f"- عدد المتحكمات: {len(module.controllers)}"
        )
        builder.add(
            f"- Services: {len(module.services)}"
            if lang == "en"
            else f"- عدد الخدمات: {len(module.services)}"
        )
        builder.add(
            f"- DTOs: {sum(len(dto.classes) for dto in module.dtos)}"
            if lang == "en"
            else f"- عدد كائنات DTO: {sum(len(dto.classes) for dto in module.dtos)}"
        )
        builder.add("")

        if module.services:
            builder.add("### Service Layer" if lang == "en" else "### طبقة الخدمات")
            for service in module.services:
                builder.add(
                    f"- `{service.class_name}` (`{service.file}`) — "
                    + (
                        "injects "
                        + ", ".join(f"`{prop}: {stype}`" for prop, stype in service.accessors)
                        if service.accessors
                        else "stateless service"
                    )
                )
                for method in service.methods:
                    if lang == "en":
                        builder.add(
                            f"  - Method `{method.name}` ({method.start_line}-{method.end_line}) orchestrates:\n"
                            f"{indent(method.snippet, 4)}"
                        )
                    else:
                        builder.add(
                            f"  - الدالة `{method.name}` ({method.start_line}-{method.end_line}) تنفذ:\n"
                            f"{indent(method.snippet, 4)}"
                        )
            builder.add("")

        if module.controllers:
            builder.add("### Controller Responsibilities" if lang == "en" else "### مسؤوليات المتحكم")
            for controller in module.controllers:
                builder.add(
                    f"- `{controller.controller_name}` routes requests through `{controller.file}` "
                    + (
                        "leveraging guards/interceptors."
                        if lang == "en"
                        else "باستخدام الحمايات والمقاطعات."
                    )
                )
                for method in controller.methods:
                    if lang == "en":
                        builder.add(
                            f"  - `{method.http_method}` `{endpoint_full_path(controller, method)}` → `{method.signature}`"
                        )
                    else:
                        builder.add(
                            f"  - `{method.http_method}` `{endpoint_full_path(controller, method)}` → `{method.signature}`"
                        )
            builder.add("")

        if module.dtos:
            builder.add("### Data Contracts" if lang == "en" else "### عقود البيانات")
            for dto in module.dtos:
                for klass in dto.classes:
                    if lang == "en":
                        builder.add(
                            f"- `{klass.class_name}` defines {len(klass.properties)} fields (source: `{dto.file}`)."
                        )
                    else:
                        builder.add(
                            f"- `{klass.class_name}` يحتوي على {len(klass.properties)} حقول (المصدر: `{dto.file}`)."
                        )
            builder.add("")

        if module.frontend:
            builder.add("### Frontend Touchpoints" if lang == "en" else "### نقاط ارتباط الواجهة الأمامية")
            for fe in module.frontend:
                for export in fe.exports:
                    if lang == "en":
                        builder.add(
                            f"- Component `{export.name}` ({export.kind}) in `{fe.file}` bridges REST endpoints."
                        )
                    else:
                        builder.add(
                            f"- المكون `{export.name}` ({export.kind}) في `{fe.file}` يستدعي واجهات REST."
                        )
            builder.add("")

        builder.add("---")
        builder.add("")

    return builder.result()


# --------------------------------------------------------------------------- #
# CIP generation
# --------------------------------------------------------------------------- #


def generate_cip(
    modules: Dict[str, ModuleMeta],
    dto_index: Dict[str, Tuple[DtoClassMeta, Path]],
    lang: str,
) -> str:
    builder = DocumentationBuilder(lang)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    if lang == "en":
        builder.add("# Change Implementation Plan (CIP)")
        builder.add("")
        builder.add(f"- **Generated**: {now}")
        builder.add(
            "- **Purpose**: Provide actionable, traceable steps for modifying or extending modules while preserving system integrity."
        )
    else:
        builder.add("# خطة تنفيذ التغييرات (CIP)")
        builder.add("")
        builder.add(f"- **تاريخ التوليد**: {now}")
        builder.add(
            "- **الهدف**: تقديم خطوات عملية قابلة للتتبع لتعديل الوحدات أو توسيعها مع الحفاظ على سلامة النظام."
        )
    builder.add("")

    for key in sorted(modules):
        label = domain_label(key, lang)
        builder.add(f"## {label}")
        builder.add("")

        for controller in modules[key].controllers:
            for method in controller.methods:
                full_path = endpoint_full_path(controller, method)
                section_title = (
                    f"### Plan for `{controller.controller_name}.{method.name}` ({method.http_method} {full_path})"
                    if lang == "en"
                    else f"### خطة لـ `{controller.controller_name}.{method.name}` ({method.http_method} {full_path})"
                )
                builder.add(section_title)
                builder.add("")

                if lang == "en":
                    builder.add("1. **Impact Analysis**")
                    builder.add(
                        f"   - Review controller logic in `{controller.file}` lines {method.start_line}-{method.end_line}."
                    )
                    builder.add(
                        "   - Identify DTOs involved: "
                        + ", ".join(
                            dto_name
                            for dto_name in dto_index
                            if re.search(rf"\b{dto_name}\b", method.params)
                        )
                    )
                    builder.add("   - Map downstream service dependencies via DI graph.")
                    builder.add("2. **Design Update**")
                    builder.add(
                        "   - Draft OpenAPI changes and synchronize with `API_USAGE_GUIDE.md`."
                    )
                    builder.add(
                        "   - Extend DTO validation with class-validator decorators as needed."
                    )
                    builder.add("3. **Implementation Steps**")
                    builder.add(
                        f"   - Update controller logic ensuring guards/roles remain enforced."
                    )
                    builder.add(
                        "   - Modify service(s) and adjust Supabase queries ensuring indices exist."
                    )
                    builder.add("   - Update frontend components to consume new schema.")
                    builder.add("4. **Testing & Verification**")
                    builder.add("   - Write unit tests for controller and service.")
                    builder.add("   - Record e2e regression via Postman or Pact tests.")
                    builder.add("   - Update CI workflows if contracts change.")
                    builder.add("5. **Deployment Checklist**")
                    builder.add("   - Apply migrations or Supabase SQL changes.")
                    builder.add("   - Monitor logs and analytics for anomalies.")
                else:
                    builder.add("1. **تحليل الأثر**")
                    builder.add(
                        f"   - مراجعة منطق المتحكم في `{controller.file}` الأسطر {method.start_line}-{method.end_line}."
                    )
                    builder.add(
                        "   - تحديد كائنات DTO المرتبطة: "
                        + ", ".join(
                            dto_name
                            for dto_name in dto_index
                            if re.search(rf"\b{dto_name}\b", method.params)
                        )
                    )
                    builder.add("   - رسم الاعتماديات نحو الخدمات عبر حقن الاعتماديات.")
                    builder.add("2. **تحديث التصميم**")
                    builder.add(
                        "   - إعداد تعديلات OpenAPI ومزامنتها مع `API_USAGE_GUIDE.md`."
                    )
                    builder.add(
                        "   - توسيع التحقق في DTO باستخدام زخارف class-validator حسب الحاجة."
                    )
                    builder.add("3. **خطوات التنفيذ**")
                    builder.add(
                        "   - تحديث منطق المتحكم مع الحفاظ على الحمايات والأدوار."
                    )
                    builder.add(
                        "   - تعديل الخدمات واستعلامات Supabase مع التأكد من توفر الفهارس."
                    )
                    builder.add("   - تحديث مكونات الواجهة الأمامية لتستهلك المخطط الجديد.")
                    builder.add("4. **الاختبار والتحقق**")
                    builder.add("   - كتابة اختبارات وحدة للمتحكم والخدمة.")
                    builder.add("   - تسجيل اختبارات تكامل شاملة عبر Postman أو Pact.")
                    builder.add("   - تحديث خطوط CI عند تغير العقود.")
                    builder.add("5. **قائمة النشر**")
                    builder.add("   - تطبيق الترقيات أو تغييرات SQL في Supabase.")
                    builder.add("   - مراقبة السجلات والتحليلات لاكتشاف الانحرافات.")

                builder.add("")

        builder.add("---")
        builder.add("")

    return builder.result()


# --------------------------------------------------------------------------- #
# Strategic Vision & Roadmap
# --------------------------------------------------------------------------- #


def generate_strategic(modules: Dict[str, ModuleMeta], service_index: Dict[str, ServiceMeta], lang: str) -> str:
    builder = DocumentationBuilder(lang)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    if lang == "en":
        builder.add("# Strategic Vision and Roadmap")
        builder.add("")
        builder.add(f"- **Generated**: {now}")
        builder.add(
            "- **Purpose**: Chart the evolutionary path for scalability, resilience, and advanced capabilities."
        )
        builder.add("")
        builder.add("## Scalability Pathways")
        builder.add(
            "- Reorganize the monolith into a modular monolith by grouping feature modules beneath feature-specific Nest modules and registering them lazily from `app.module.ts`."
        )
        builder.add(
            "- Introduce caching tiers (Redis or Supabase edge functions) wrapping `PropertiesService.findAll` and `CustomersService.findAll` to amortize complex filtering."
        )
        builder.add(
            "- Prepare microservice boundaries for Payments and Notifications by encapsulating service facades and adopting message brokers such as NATS or RabbitMQ."
        )
        builder.add(
            "- Implement database sharding options by separating analytical workloads into Supabase read replicas and maintaining OLTP traffic on the primary instance."
        )
        builder.add(
            "- Harden background processing by adopting durable queues (BullMQ) for Excel imports, lead scoring batches, and valuation model inference tasks."
        )
        builder.add(
            "- Standardize configuration management through environment schemas and secrets rotation supported by `ENV_TEMPLATE_BACKEND.env`."
        )
        builder.add("")
        builder.add("## Future Feature Integration")
        builder.add("### AI-Powered Property Valuation")
        builder.add(
            "- Introduce a dedicated `ValuationService` combining historical Supabase data (`properties`, `contracts`, `rental_payments`) with market feeds ingested via integrations."
        )
        builder.add(
            "- Design REST surface `/properties/:id/valuation` handled by a new `ValuationsController` delegating to asynchronous valuation jobs."
        )
        builder.add(
            "- Train gradient boosting or transformer models offline, persist artifacts in Supabase storage, and expose inference through edge functions."
        )
        builder.add(
            "- Enhance `/Web/src/components/properties/PropertyCard.tsx` to display valuation ranges, confidence scores, and refresh timestamps."
        )
        builder.add(
            "- Instrument evaluation feedback loops by capturing manual adjustments from property managers and feeding them into retraining pipelines."
        )
        builder.add("### Automated Lead Scoring")
        builder.add(
            "- Extend the Customers domain with `LeadScoringService` that aggregates interactions, notes, and appointment success rates for each customer profile."
        )
        builder.add(
            "- Persist scores into a new Supabase table `customer_lead_scores` with history tracking for explainable insights."
        )
        builder.add(
            "- Surface scoring endpoints via `CustomersController` (`GET /customers/:id/lead-score`) and analytics dashboards under `/Web/src/dashboard/analytics`."
        )
        builder.add(
            "- Integrate notification triggers to WhatsApp workflows notifying sales agents when high-ranking leads emerge."
        )
        builder.add(
            "- Provide UI heat maps inside forthcoming `CustomerDetail` components to visualize score contributions per interaction."
        )
        builder.add("")
        builder.add("## Current Baseline by Module")
        for key in sorted(modules):
            module = modules[key]
            label = domain_label(key, lang)
            context_en = MODULE_CONTEXT.get(key, (f"Module `{label}` groups specialised logic.", ""))[0]
            scaling_en = SCALING_NOTES.get(
                key, ("Monitor Supabase query performance and API latency for sustained growth.", "")
            )[0]
            controller_names = ", ".join(f"`{c.controller_name}`" for c in module.controllers) or "None"
            controller_methods = sum(len(c.methods) for c in module.controllers)
            service_names = ", ".join(f"`{s.class_name}`" for s in module.services) or "None"
            service_methods = sum(len(s.methods) for s in module.services)
            dto_names = ", ".join(
                f"`{klass.class_name}`"
                for dto in module.dtos
                for klass in dto.classes
            ) or "None"
            frontend_exports = ", ".join(
                f"`{export.name}`"
                for fe in module.frontend
                for export in fe.exports
            ) or "None"
            builder.add(f"### {label} Module Footprint")
            builder.add(f"- Narrative: {context_en}")
            builder.add(f"- Controllers: {controller_names} ({controller_methods} endpoints).")
            builder.add(f"- Services: {service_names} ({service_methods} core methods).")
            builder.add(f"- DTO coverage: {dto_names}.")
            builder.add(f"- Frontend touchpoints: {frontend_exports}.")
            builder.add(f"- Scaling watchpoints: {scaling_en}")
            builder.add("")
        builder.add("## Strategic Initiatives Roadmap")
        builder.add("### Phase 1 – Foundation (0-3 months)")
        builder.add(
            "- Finalize modular architecture, introduce caching, and document API contracts within `/Project_Documentation/EN/ADD.md`."
        )
        builder.add("- Establish automated data quality checks on Supabase tables using scheduled edge functions.")
        builder.add("- Roll out observability stack (OpenTelemetry exporters and structured logging).")
        builder.add("### Phase 2 – Intelligence (3-6 months)")
        builder.add("- Deliver AI valuation MVP and integrate lead scoring preview dashboards.")
        builder.add("- Launch WhatsApp engagement workflows tied to lead score thresholds.")
        builder.add("- Expand analytics exports with predictive KPIs and forecasting models.")
        builder.add("### Phase 3 – Ecosystem (6-12 months)")
        builder.add("- Extract Payments into a microservice with event sourcing for auditability.")
        builder.add("- Provide partner APIs for brokers and embed custom widgets using Next.js edge middleware.")
        builder.add("- Harden multi-tenant governance, billing, and automated compliance reporting.")
        builder.add("")
        builder.add("## Risk Matrix")
        builder.add("### Technical Risks")
        builder.add("- Supabase rate limits under heavy analytical workloads — mitigate via caching and read replicas.")
        builder.add("- Model drift for AI valuations — schedule quarterly retraining and monitoring dashboards.")
        builder.add("- Frontend bundle growth — enforce route-based code splitting and shared component audits.")
        builder.add("### Organisational Risks")
        builder.add("- Change management for sales teams adopting automated lead scores — deploy enablement workshops.")
        builder.add("- Dependency on third-party integrations (n8n, WhatsApp) — maintain fallback channels and SLA monitoring.")
        builder.add("- Talent ramp-up — codify onboarding using `Codebase_Deep_Dive.md` and pair programming rotations.")
        builder.add("### Data & Compliance Risks")
        builder.add("- Sensitive customer data flowing to AI pipelines — implement anonymisation and consent tracking.")
        builder.add("- Ensure GDPR/CCPA readiness with data retention policies coded into Supabase row level security.")
        builder.add("- Maintain audit logs for valuation adjustments accessible to auditors.")
        builder.add("")
        builder.add("## Success Metrics & KPIs")
        builder.add("- API median latency under 250ms for property listing endpoints.")
        builder.add("- Lead-to-sale conversion uplift of 15% post automated scoring rollout.")
        builder.add("- 90% automated valuation coverage across active property inventory.")
        builder.add("- Reduction of manual Excel imports by 60% through background automation.")
        builder.add("- Support ticket resolution time under 24 hours aided by maintenance workflows.")
        builder.add("")
        builder.add("## Operational Readiness")
        builder.add("- Establish runbooks covering deployments, rollbacks, and incident escalation.")
        builder.add("- Adopt blue/green deployment strategy using container orchestration (e.g., Docker + ECS/Kubernetes).")
        builder.add("- Formalize security reviews and dependency scanning integrated into CI pipelines.")
        builder.add("- Expand automated testing to cover property import edge cases and analytics regression suites.")
        builder.add("")
        builder.add("## Immediate Next Steps")
        builder.add("- Approve data governance charter and align stakeholders on AI feature milestones.")
        builder.add("- Stand up Redis cluster for caching experiments and benchmark filter-heavy endpoints.")
        builder.add("- Document microservice candidate boundaries and draft migration spikes.")
        builder.add("- Schedule cross-functional design reviews for valuation UX and lead scoring outputs.")

    else:
        builder.add("# الرؤية الإستراتيجية وخارطة الطريق")
        builder.add("")
        builder.add(f"- **تاريخ التوليد**: {now}")
        builder.add(
            "- **الهدف**: تحديد مسار التطور نحو قابلية التوسع والمرونة والقدرات المتقدمة."
        )
        builder.add("")
        builder.add("## مسارات التوسع")
        builder.add(
            "- إعادة تنظيم الأحادية إلى أحادية معيارية عبر تجميع الوحدات الميزة وتسجيلها بشكل كسول من `app.module.ts`."
        )
        builder.add(
            "- إدخال طبقات تخزين مؤقت (Redis أو وظائف Supabase الطرفية) تغلف `PropertiesService.findAll` و`CustomersService.findAll` لتقليل التصفية المكثفة."
        )
        builder.add(
            "- تحضير حدود الخدمات المصغرة للمدفوعات والإشعارات عبر تغليف واجهات الخدمة واعتماد وسطاء الرسائل مثل NATS أو RabbitMQ."
        )
        builder.add(
            "- تنفيذ خيارات تقسيم قاعدة البيانات بفصل أحمال التحليلات إلى نسخ قراءة في Supabase والإبقاء على معاملات OLTP في الخادم الرئيسي."
        )
        builder.add(
            "- تعزيز المعالجة الخلفية بتبني طوابير متينة (BullMQ) لمهام استيراد Excel ودفعات تصنيف العملاء وتخمينات التقييم."
        )
        builder.add(
            "- توحيد إدارة الإعدادات عبر مخططات المتغيرات البيئية وتدوير الأسرار المدعوم بـ `ENV_TEMPLATE_BACKEND.env`."
        )
        builder.add("")
        builder.add("## دمج الميزات المستقبلية")
        builder.add("### التقييم العقاري المدعوم بالذكاء الاصطناعي")
        builder.add(
            "- إضافة `ValuationService` مخصصة تجمع بيانات Supabase التاريخية (`properties`, `contracts`, `rental_payments`) مع تغذية سوقية خارجية."
        )
        builder.add(
            "- تصميم واجهة REST `/properties/:id/valuation` يديرها `ValuationsController` جديد يفوض إلى مهام تقدير غير متزامنة."
        )
        builder.add(
            "- تدريب نماذج التعلم الآلي (مثل Gradient Boosting أو Transformers) خارجياً وتخزين النماذج في Supabase واستهلاكها عبر وظائف طرفية."
        )
        builder.add(
            "- تحديث `/Web/src/components/properties/PropertyCard.tsx` لإظهار نطاقات التقييم ونسب الثقة وأوقات التحديث."
        )
        builder.add(
            "- بناء دورة تغذية راجعة بتسجيل التعديلات اليدوية من مديري العقارات وإدخالها في إعادة التدريب."
        )
        builder.add("### تصنيف العملاء المحتملين تلقائياً")
        builder.add(
            "- توسيع نطاق وحدة العملاء بخدمة `LeadScoringService` تجمع التفاعلات والملاحظات ونتائج المواعيد لكل ملف عميل."
        )
        builder.add(
            "- تخزين الدرجات في جدول Supabase جديد `customer_lead_scores` مع تتبع تاريخي لضمان الشفافية."
        )
        builder.add(
            "- عرض نقاط التصنيف عبر واجهات `CustomersController` (`GET /customers/:id/lead-score`) وفي لوحات التحليلات تحت `/Web/src/dashboard/analytics`."
        )
        builder.add(
            "- دمج مشغلات الإشعارات مع تدفقات واتساب لإبلاغ مندوبي المبيعات عند ظهور عملاء ذوي أولوية عالية."
        )
        builder.add(
            "- توفير تمثيل بصري داخل مكونات `CustomerDetail` المستقبلية لشرح مساهمة كل تفاعل."
        )
        builder.add("")
        builder.add("## الوضع الحالي لكل وحدة")
        for key in sorted(modules):
            module = modules[key]
            label = domain_label(key, lang)
            context_ar = MODULE_CONTEXT.get(key, ("", f"وحدة `{label}` تجمع منطقاً متخصصاً."))[1]
            scaling_ar = SCALING_NOTES.get(
                key, ("", "مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.")
            )[1]
            controller_names = "، ".join(f"`{c.controller_name}`" for c in module.controllers) or "لا يوجد"
            controller_methods = sum(len(c.methods) for c in module.controllers)
            service_names = "، ".join(f"`{s.class_name}`" for s in module.services) or "لا يوجد"
            service_methods = sum(len(s.methods) for s in module.services)
            dto_names = "، ".join(
                f"`{klass.class_name}`"
                for dto in module.dtos
                for klass in dto.classes
            ) or "لا يوجد"
            frontend_exports = "، ".join(
                f"`{export.name}`"
                for fe in module.frontend
                for export in fe.exports
            ) or "لا يوجد"
            builder.add(f"### بصمة وحدة {label}")
            description_ar = context_ar if context_ar else f"وحدة `{label}` تجمع منطقاً متخصصاً."
            builder.add(f"- الوصف: {description_ar}")
            builder.add(f"- المتحكمات: {controller_names} ({controller_methods} نقطة نهاية).")
            builder.add(f"- الخدمات: {service_names} ({service_methods} دالة جوهرية).")
            builder.add(f"- كائنات DTO: {dto_names}.")
            builder.add(f"- مكونات الواجهة الأمامية: {frontend_exports}.")
            builder.add(f"- نقاط مراقبة التوسع: {scaling_ar}")
            builder.add("")
        builder.add("## خارطة المبادرات الإستراتيجية")
        builder.add("### المرحلة 1 – الأساس (0-3 أشهر)")
        builder.add(
            "- إتمام إعادة الهيكلة المعيارية، إدخال التخزين المؤقت، وتوثيق العقود داخل `/Project_Documentation/AR/ADD_AR.md`."
        )
        builder.add("- إنشاء فحوصات جودة بيانات آلية على جداول Supabase عبر وظائف مجدولة.")
        builder.add("- نشر منظومة مراقبة (OpenTelemetry وتسجيلات منظمة).")
        builder.add("### المرحلة 2 – الذكاء (3-6 أشهر)")
        builder.add("- إطلاق الإصدار الأول من التقييم الذكي ولوحات معاينة تصنيف العملاء.")
        builder.add("- تشغيل تدفقات واتساب المرتبطة بدرجات العملاء المحتملين.")
        builder.add("- توسيع تقارير التحليلات بمؤشرات تنبؤية ونماذج توقع.")
        builder.add("### المرحلة 3 – النظام البيئي (6-12 شهراً)")
        builder.add("- فصل المدفوعات إلى خدمة مصغرة مع تتبع أحداث لأغراض التدقيق.")
        builder.add("- توفير واجهات شركاء للوسطاء وت嵌يد عناصر مخصصة باستخدام Edge Middleware في Next.js.")
        builder.add("- تعزيز الحوكمة متعددة المستأجرين والفوترة والتقارير الالتزامية الآلية.")
        builder.add("")
        builder.add("## مصفوفة المخاطر")
        builder.add("### مخاطر تقنية")
        builder.add("- حدود معدل Supabase أثناء التحليلات المكثفة — الحل عبر التخزين المؤقت ونسخ القراءة.")
        builder.add("- انجراف نماذج التقييم — فرض إعادة تدريب ربع سنوية ولوحات مراقبة.")
        builder.add("- تضخم حزم الواجهة الأمامية — تطبيق تقسيم الشيفرة حسب الصفحات ومراجعة المكونات المشتركة.")
        builder.add("### مخاطر تنظيمية")
        builder.add("- إدارة التغيير لفرق المبيعات مع اعتماد التصنيف الآلي — إطلاق ورش تمكين.")
        builder.add("- الاعتمادية على التكاملات الخارجية (n8n، واتساب) — توفير قنوات بديلة ومراقبة اتفاقيات الخدمة.")
        builder.add("- تسريع تأهيل الموظفين — استخدام `Codebase_Deep_Dive_AR.md` ودوارات البرمجة الثنائية.")
        builder.add("### مخاطر البيانات والامتثال")
        builder.add("- تدفق بيانات حساسة إلى مسارات الذكاء الاصطناعي — تطبيق إخفاء الهوية وتتبّع الموافقات.")
        builder.add("- ضمان الاستعداد لـ GDPR/CCPA عبر سياسات الاحتفاظ المرمزة في قواعد أمان Supabase.")
        builder.add("- الحفاظ على سجلات تدقيق لتعديلات التقييم متاحة للمراجعين.")
        builder.add("")
        builder.add("## مؤشرات النجاح وقياسات الأداء")
        builder.add("- زمن استجابة واجهة `/properties` أقل من 250 مللي ثانية وسطياً.")
        builder.add("- زيادة نسبة تحويل العملاء المحتملين إلى مبيعات بمعدل 15٪ بعد إطلاق التصنيف الآلي.")
        builder.add("- تغطية تقييم آلي بنسبة 90٪ من محفظة العقارات النشطة.")
        builder.add("- خفض الاستيراد اليدوي عبر Excel بنسبة 60٪ بفضل الأتمتة الخلفية.")
        builder.add("- زمن معالجة تذاكر الدعم أقل من 24 ساعة بدعم مسارات الصيانة.")
        builder.add("")
        builder.add("## الجاهزية التشغيلية")
        builder.add("- إعداد أدلة تشغيل تغطي النشر والتراجع وتصعيد الحوادث.")
        builder.add("- اعتماد استراتيجية نشر زرقاء/خضراء باستخدام الحاويات (Docker + ECS/Kubernetes).")
        builder.add("- ترسيخ مراجعات الأمان وفحص الاعتماديات ضمن خطوط CI.")
        builder.add("- توسيع الاختبارات الآلية لتغطية حالات استيراد العقارات واسترجاعات التحليلات.")
        builder.add("")
        builder.add("## الخطوات التالية العاجلة")
        builder.add("- إقرار ميثاق حوكمة البيانات ومزامنة المعنيين حول معالم ميزات الذكاء الاصطناعي.")
        builder.add("- تجهيز عنقود Redis للتجارب مع التخزين المؤقت وقياس أداء التصفية الكثيفة.")
        builder.add("- توثيق حدود الخدمات المصغرة المرشحة وإعداد مسودات تجريبية للترحيل.")
        builder.add("- جدولة مراجعات تصميمية مشتركة لتجربة التقييم ونتائج تصنيف العملاء.")

    builder.add("")
    builder.add("---")
    builder.add("")
    return builder.result()


# --------------------------------------------------------------------------- #
# Codebase Deep Dive
# --------------------------------------------------------------------------- #


def generate_deep_dive(
    modules: Dict[str, ModuleMeta],
    service_index: Dict[str, ServiceMeta],
    dto_index: Dict[str, Tuple[DtoClassMeta, Path]],
    dto_usage: Dict[str, List[Tuple[ControllerMeta, MethodMeta]]],
    lang: str,
) -> str:
    builder = DocumentationBuilder(lang)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    if lang == "en":
        builder.add("# Codebase Deep Dive")
        builder.add("")
        builder.add(f"- **Generated**: {now}")
        builder.add(
            "- **Purpose**: Serve as an exhaustive onboarding manual describing every major file."
        )
    else:
        builder.add("# جولة عميقة في الشفرة")
        builder.add("")
        builder.add(f"- **تاريخ التوليد**: {now}")
        builder.add(
            "- **الهدف**: دليل استيعاب شامل يصف كل ملف رئيسي في المشروع."
        )
    builder.add("")

    for key in sorted(modules):
        label = domain_label(key, lang)
        context_en, context_ar = MODULE_CONTEXT.get(
            key,
            (
                f"The `{label}` module encapsulates domain responsibilities.",
                f"وحدة `{label}` تجمع مسؤوليات المجال.",
            ),
        )
        if lang == "en":
            builder.add(f"## {label} Module Deep Dive")
            builder.add(f"- Summary: {context_en}")
        else:
            builder.add(f"## وحدة {label} بالتفصيل")
            builder.add(f"- ملخص: {context_ar}")
        builder.add("")

        module = modules[key]

        # Controllers
        if module.controllers:
            builder.add("### Controllers" if lang == "en" else "### المتحكمات")
            for controller in module.controllers:
                builder.add(f"#### File: `{controller.file}`")
                method_count = len(controller.methods)
                if lang == "en":
                    builder.add(
                        f"- Purpose: Orchestrates {method_count} endpoint(s) for {label.lower()} workflows while enforcing guards and role checks."
                    )
                else:
                    builder.add(
                        f"- الغرض: يدير {method_count} نقطة نهاية لمسارات {label} مع فرض الحمايات والتحقق من الأدوار."
                    )
                unique_decorators = sorted({decor for m in controller.methods for decor in m.decorators})
                services_injected = ", ".join(f"`{prop}: {stype}`" for prop, stype in controller.injected) or (
                    "None" if lang == "en" else "لا يوجد"
                )
                if lang == "en":
                    builder.add(f"- Injected services: {services_injected}")
                    builder.add(f"- Decorators/guards: {', '.join(unique_decorators) if unique_decorators else 'None'}")
                    builder.add("- Key Methods:")
                else:
                    builder.add(f"- الخدمات المحقونة: {services_injected}")
                    builder.add(f"- الزخارف/الحمايات: {', '.join(unique_decorators) if unique_decorators else 'لا يوجد'}")
                    builder.add("- الدوال الرئيسية:")

                for method in controller.methods:
                    endpoint = endpoint_full_path(controller, method)
                    dtos = dto_mentions_in_method(method, dto_index.keys())
                    dto_display = ", ".join(f"`{name}`" for name in dtos) if dtos else ("None" if lang == "en" else "لا يوجد")
                    service_calls = extract_service_calls(method)
                    resolved_calls: List[str] = []
                    for prop_name, service_method in service_calls:
                        service_type = next((stype for prop, stype in controller.injected if prop == prop_name), None)
                        if service_type:
                            resolved_calls.append(f"{service_type}.{service_method}")
                        else:
                            resolved_calls.append(f"{prop_name}.{service_method}")
                    call_display = (
                        ", ".join(f"`{call}`" for call in resolved_calls)
                        if resolved_calls
                        else ("Inline logic" if lang == "en" else "منطق داخل المتحكم")
                    )
                    roles_text = format_roles(method.roles, "en") if lang == "en" else format_roles(method.roles, "ar")
                    if lang == "en":
                        builder.add(
                            f"  - `{method.name}` → {method.http_method or 'Custom'} `{endpoint}`; roles: {roles_text}; DTOs: {dto_display}; services: {call_display}."
                        )
                    else:
                        builder.add(
                            f"  - `{method.name}` → {method.http_method or 'مخصص'} `{endpoint}`؛ الأدوار: {roles_text}; DTOs: {dto_display}; الخدمات: {call_display}."
                        )
                    builder.add_code_block(method.snippet, language="ts")

                if lang == "en":
                    builder.add("- Execution Flow:")
                    builder.add("  1. Request enters through Nest middleware and `RolesGuard` verification.")
                    builder.add("  2. Controller derives tenant context (`req.user.office_id`).")
                    builder.add("  3. Domain service executes Supabase data access or side effects.")
                    builder.add("  4. Response is normalized and returned to the client/front-end consumer.")
                else:
                    builder.add("- تسلسل التنفيذ:")
                    builder.add("  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.")
                    builder.add("  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.")
                    builder.add("  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.")
                    builder.add("  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.")
                builder.add("")

        # Services
        if module.services:
            builder.add("### Services" if lang == "en" else "### الخدمات")
            for service in module.services:
                builder.add(f"#### File: `{service.file}`")
                method_count = len(service.methods)
                if lang == "en":
                    builder.add(
                        f"- Purpose: Implements {label.lower()} business rules with {method_count} public method(s)."
                    )
                else:
                    builder.add(f"- الغرض: يطبق قواعد {label} التجارية عبر {method_count} دالة عمومية.")
                accessors = ", ".join(f"`{prop}: {stype}`" for prop, stype in service.accessors) or (
                    "None" if lang == "en" else "لا يوجد"
                )
                builder.add(f"- Dependencies: {accessors}" if lang == "en" else f"- الاعتماديات: {accessors}")
                if lang == "en":
                    builder.add("- Methods:")
                else:
                    builder.add("- الدوال:")

                for method in service.methods:
                    traits: List[str] = []
                    if "supabase" in method.snippet:
                        traits.append("Supabase data access")
                    if "cache" in method.snippet or "Cache" in method.snippet:
                        traits.append("caching")
                    if "throw" in method.snippet or "Exception" in method.snippet:
                        traits.append("error signalling")
                    trait_text = ", ".join(traits) if traits else ("business logic" if lang == "en" else "منطق أعمال")
                    if lang == "en":
                        builder.add(
                            f"  - `{method.name}({method.params})` lines {method.start_line}-{method.end_line} — {trait_text}."
                        )
                    else:
                        builder.add(
                            f"  - `{method.name}({method.params})` الأسطر {method.start_line}-{method.end_line} — {trait_text}."
                        )
                    builder.add_code_block(method.snippet, language="ts")
                if lang == "en":
                    builder.add(
                        "- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data."
                    )
                else:
                    builder.add(
                        "- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية."
                    )
                builder.add("")

        # DTOs
        if module.dtos:
            builder.add("### DTOs" if lang == "en" else "### كائنات DTO")
            for dto in module.dtos:
                for klass in dto.classes:
                    builder.add(f"- `{klass.class_name}` (`{dto.file}`)")
                    if lang == "en":
                        builder.add("  - Fields:")
                    else:
                        builder.add("  - الحقول:")
                    for prop in klass.properties:
                        decorators = ", ".join(prop.decorators) if prop.decorators else (
                            "None" if lang == "en" else "لا يوجد"
                        )
                        if lang == "en":
                            builder.add(
                                f"    - `{prop.name}`: `{prop.type_annotation}`; validators: {decorators}"
                            )
                        else:
                            builder.add(
                                f"    - `{prop.name}`: `{prop.type_annotation}`؛ أدوات التحقق: {decorators}"
                            )
                    usages = dto_usage.get(klass.class_name, [])
                    if usages:
                        usage_display = ", ".join(
                            f"{usage_controller.controller_name}.{usage_method.name}"
                            for usage_controller, usage_method in usages
                        )
                    else:
                        usage_display = "None" if lang == "en" else "لا يوجد"
                    if lang == "en":
                        builder.add(f"  - Used by: {usage_display}")
                    else:
                        builder.add(f"  - مستخدم في: {usage_display}")
            builder.add("")

        # Frontend components/pages
        if module.frontend:
            builder.add("### Frontend Surfaces" if lang == "en" else "### واجهة المستخدم")
            for fe in module.frontend:
                export_names = ", ".join(f"`{export.name}`" for export in fe.exports)
                if lang == "en":
                    builder.add(f"- File `{fe.file}`")
                    builder.add(f"  - Exports: {export_names}")
                    builder.add(
                        "  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above."
                    )
                else:
                    builder.add(f"- الملف `{fe.file}`")
                    builder.add(f"  - التصديرات: {export_names}")
                    builder.add(
                        "  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه."
                    )
                for export in fe.exports:
                    if lang == "en":
                        builder.add(
                            f"  - `{export.name}` spans lines {export.start_line}-{export.end_line} and encapsulates UI state for {label.lower()}."
                        )
                    else:
                        builder.add(
                            f"  - `{export.name}` يقع بين الأسطر {export.start_line}-{export.end_line} ويغلف حالة الواجهة لـ {label}."
                        )
                    builder.add_code_block(export.snippet, language="tsx")
            builder.add("")

        builder.add("")

    return builder.result()


# --------------------------------------------------------------------------- #
# Generation Orchestrator
# --------------------------------------------------------------------------- #


def main() -> None:
    controllers = parse_controllers()
    services = parse_services()
    dtos = parse_dtos()
    frontend = parse_frontend()

    modules = build_modules(controllers, services, dtos, frontend)
    dto_index = index_dtos(dtos)
    service_index = service_lookup(services)
    dto_usage = map_dto_usage(controllers, dto_index.keys())

    DOC_EN.mkdir(parents=True, exist_ok=True)
    DOC_AR.mkdir(parents=True, exist_ok=True)

    documents = {
        "SRS": generate_srs(modules, dto_index, service_index, lang="en"),
        "ADD": generate_add(modules, service_index, lang="en"),
        "CIP": generate_cip(modules, dto_index, lang="en"),
        "Strategic_Vision_and_Roadmap": generate_strategic(modules, service_index, lang="en"),
        "Codebase_Deep_Dive": generate_deep_dive(modules, service_index, dto_index, dto_usage, lang="en"),
    }

    documents_ar = {
        "SRS_AR": generate_srs(modules, dto_index, service_index, lang="ar"),
        "ADD_AR": generate_add(modules, service_index, lang="ar"),
        "CIP_AR": generate_cip(modules, dto_index, lang="ar"),
        "Strategic_Vision_and_Roadmap_AR": generate_strategic(modules, service_index, lang="ar"),
        "Codebase_Deep_Dive_AR": generate_deep_dive(modules, service_index, dto_index, dto_usage, lang="ar"),
    }

    for name, content in documents.items():
        target = DOC_EN / f"{name}.md"
        target.write_text(content, encoding="utf-8")

    for name, content in documents_ar.items():
        target = DOC_AR / f"{name}.md"
        target.write_text(content, encoding="utf-8")

    print("Documentation generation completed.")


if __name__ == "__main__":
    main()

