"""Jurisdiction classification and formatting helper.

Identifies tax jurisdiction (State, Federal, General) for help articles,
enabling filtering, sorting, and Pagefind indexing across the portal.
"""

from __future__ import annotations
import re

STATE_MAP = {
    "alabama": ("AL", "Alabama"),
    "alaska": ("AK", "Alaska"),
    "arizona": ("AZ", "Arizona"),
    "arkansas": ("AR", "Arkansas"),
    "california": ("CA", "California"),
    "colorado": ("CO", "Colorado"),
    "connecticut": ("CT", "Connecticut"),
    "delaware": ("DE", "Delaware"),
    "florida": ("FL", "Florida"),
    "georgia": ("GA", "Georgia"),
    "hawaii": ("HI", "Hawaii"),
    "idaho": ("ID", "Idaho"),
    "illinois": ("IL", "Illinois"),
    "indiana": ("IN", "Indiana"),
    "iowa": ("IA", "Iowa"),
    "kansas": ("KS", "Kansas"),
    "kentucky": ("KY", "Kentucky"),
    "louisiana": ("LA", "Louisiana"),
    "maine": ("ME", "Maine"),
    "maryland": ("MD", "Maryland"),
    "massachusetts": ("MA", "Massachusetts"),
    "michigan": ("MI", "Michigan"),
    "minnesota": ("MN", "Minnesota"),
    "mississippi": ("MS", "Mississippi"),
    "missouri": ("MO", "Missouri"),
    "montana": ("MT", "Montana"),
    "nebraska": ("NE", "Nebraska"),
    "nevada": ("NV", "Nevada"),
    "new hampshire": ("NH", "New Hampshire"),
    "new jersey": ("NJ", "New Jersey"),
    "new mexico": ("NM", "New Mexico"),
    "new york": ("NY", "New York"),
    "north carolina": ("NC", "North Carolina"),
    "north dakota": ("ND", "North Dakota"),
    "ohio": ("OH", "Ohio"),
    "oklahoma": ("OK", "Oklahoma"),
    "oregon": ("OR", "Oregon"),
    "pennsylvania": ("PA", "Pennsylvania"),
    "rhode island": ("RI", "Rhode Island"),
    "south carolina": ("SC", "South Carolina"),
    "south dakota": ("SD", "South Dakota"),
    "tennessee": ("TN", "Tennessee"),
    "texas": ("TX", "Texas"),
    "utah": ("UT", "Utah"),
    "vermont": ("VT", "Vermont"),
    "virginia": ("VA", "Virginia"),
    "washington": ("WA", "Washington"),
    "west virginia": ("WV", "West Virginia"),
    "wisconsin": ("WI", "Wisconsin"),
    "wyoming": ("WY", "Wyoming"),
    "district of columbia": ("DC", "District of Columbia")
}


def detect_jurisdiction(article: dict) -> dict:
    """Classifies an article into a jurisdiction struct.

    Returns dict:
        code: 'CA', 'NY', 'Federal', 'General', etc.
        label: 'California (CA)', 'Federal', 'General / Federal', etc.
        type: 'State', 'Federal', 'General'
        name: 'California', 'Federal', etc.
        icon: '📍', '🏛️', '🌐'
    """
    path = str(article.get("path", "")).lower()
    bc = [str(b).lower() for b in article.get("breadcrumb", [])]
    title = str(article.get("title", "")).lower()

    # 1. Path segment evaluation
    segs = path.split("/")
    for i, s in enumerate(segs):
        if s == "states" and i + 1 < len(segs):
            nxt = segs[i + 1].replace("-", " ")
            if nxt in STATE_MAP:
                code, name = STATE_MAP[nxt]
                return {"code": code, "label": f"{name} ({code})", "type": "State", "name": name, "icon": "📍"}
        if s in STATE_MAP:
            code, name = STATE_MAP[s]
            return {"code": code, "label": f"{name} ({code})", "type": "State", "name": name, "icon": "📍"}
        if s == "federal":
            return {"code": "Federal", "label": "Federal", "type": "Federal", "name": "Federal", "icon": "🏛️"}

    # 2. Breadcrumb evaluation
    for b in bc:
        b_clean = b.replace("-", " ").strip()
        if b_clean in STATE_MAP:
            code, name = STATE_MAP[b_clean]
            return {"code": code, "label": f"{name} ({code})", "type": "State", "name": name, "icon": "📍"}
        if b == "federal":
            return {"code": "Federal", "label": "Federal", "type": "Federal", "name": "Federal", "icon": "🏛️"}

    # 3. Title evaluation
    m_sf = re.search(r"\b([a-z]{2})form[a-z]*\d", title)
    if m_sf:
        ab = m_sf.group(1).upper()
        for k, (code, name) in STATE_MAP.items():
            if code == ab:
                return {"code": code, "label": f"{name} ({code})", "type": "State", "name": name, "icon": "📍"}

    for name_key, (code, name) in STATE_MAP.items():
        if re.search(r"\b" + re.escape(name_key) + r"\b", title):
            return {"code": code, "label": f"{name} ({code})", "type": "State", "name": name, "icon": "📍"}

    if any(k in title for k in ("federal", "irs", "mef", "form 1040", "form 1065", "form 1120", "form 709", "form 706", "form 990")):
        return {"code": "Federal", "label": "Federal", "type": "Federal", "name": "Federal", "icon": "🏛️"}

    return {"code": "General", "label": "General / Federal", "type": "General", "name": "General / Federal", "icon": "🌐"}
