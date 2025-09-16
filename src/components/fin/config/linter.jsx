json
{
  "rules": [
    {"name":"slug_ascii","pattern":"^[a-z0-9-]+$","fields":["module","submodule.slug"]},
    {"name":"no_tildes","pattern":"^[ -~]+$","fields":["module","submodule.slug","namespace","routing_contract.url_pattern"]},
    {"name":"switch_eq_slug","assert":"routing_contract.switch_case_must_match == submodule.slug"},
    {"name":"namespace_unique","assert":"namespace is unique across module"},
    {"name":"dashboard_shape","when":"submodule.slug == 'dashboard'","require":["kpis","widgets"]},
    {"name":"workview_shape","when":"submodule.slug != 'dashboard'","require":["views"]},
    {"name":"no_token_override","forbid_fields":["design_tokens.colors.primary","design_tokens.font_family","design_tokens.radius","design_tokens.shadow"]}
  ],
  "fail_on_violation": true
}
