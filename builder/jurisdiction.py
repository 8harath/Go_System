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


def _struct(code: str, label: str, kind: str, name: str, icon: str, slug: str) -> dict:
    """One jurisdiction record, shared by every consumer.

    `short` and `slug` live here rather than in each caller so the abbreviation
    badge on an article page and the URL of its catalog index can never drift
    apart.

    `short` is what the UI shows when space is tight — deliberately text, not
    colour, so the jurisdiction survives greyscale and forced-colors mode.

    `slug` spells the jurisdiction out ("california", not "ca"). It matches the
    scraped corpus's own URL shape (.../states/california/...), and "ca" alone is
    ambiguous enough to be worth the extra characters.
    """
    return {
        "code": code,
        "label": label,
        "type": kind,
        "name": name,
        "icon": icon,
        "short": {"Federal": "FED", "General": "GEN"}.get(code, code),
        "slug": slug,
    }


def _state(code: str, name: str) -> dict:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return _struct(code, f"{name} ({code})", "State", name, "📍", slug)


_FEDERAL = _struct("Federal", "Federal", "Federal", "Federal", "🏛️", "federal")
_GENERAL = _struct("General", "General / Federal", "General", "General / Federal", "🌐", "general")


def all_jurisdictions() -> list[dict]:
    """Every jurisdiction detect_jurisdiction() can return, Federal first.

    The site generates a catalog index page for each of these, including the ones
    with no articles in the current corpus. Wyoming and South Dakota have none
    today, but the resolver's manual mode still offers all 52 choices and a
    jurisdiction whose only articles are category pages would be classified here
    while being absent from the catalog — so a page that merely says "nothing
    indexed here yet" is the difference between an honest empty state and a 404.
    """
    states = sorted((_state(code, name) for code, name in STATE_MAP.values()),
                    key=lambda entry: entry["name"])
    return [dict(_FEDERAL), dict(_GENERAL), *states]


def detect_jurisdiction(article: dict) -> dict:
    """Classifies an article into a jurisdiction struct.

    Returns dict:
        code:  'CA', 'NY', 'Federal', 'General', etc.
        label: 'California (CA)', 'Federal', 'General / Federal', etc.
        type:  'State', 'Federal', 'General'
        name:  'California', 'Federal', etc.
        icon:  '📍', '🏛️', '🌐'
        short: 'CA', 'FED', 'GEN'          — the abbreviation badge
        slug:  'ca', 'federal', 'general'  — the /errors/jurisdiction/<slug>/ path
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
                return _state(*STATE_MAP[nxt])
        if s in STATE_MAP:
            return _state(*STATE_MAP[s])
        if s == "federal":
            return dict(_FEDERAL)

    # 2. Breadcrumb evaluation
    for b in bc:
        b_clean = b.replace("-", " ").strip()
        if b_clean in STATE_MAP:
            return _state(*STATE_MAP[b_clean])
        if b == "federal":
            return dict(_FEDERAL)

    # 3. Title evaluation
    m_sf = re.search(r"\b([a-z]{2})form[a-z]*\d", title)
    if m_sf:
        ab = m_sf.group(1).upper()
        for code, name in STATE_MAP.values():
            if code == ab:
                return _state(code, name)

    for name_key, (code, name) in STATE_MAP.items():
        if re.search(r"\b" + re.escape(name_key) + r"\b", title):
            return _state(code, name)

    if any(k in title for k in ("federal", "irs", "mef", "form 1040", "form 1065", "form 1120", "form 709", "form 706", "form 990")):
        return dict(_FEDERAL)

    return dict(_GENERAL)
