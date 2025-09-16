json
{
  "roles": ["accountant","finance_manager","cfo","admin"],
  "permissions": {
    "accountant": ["view","filter","export","send_paylink","promise","open_3wm"],
    "finance_manager": ["approve","reject","schedule","batch_approve","batch_schedule","optimize_batches"],
    "cfo": ["*"],
    "admin": ["*"]
  },
  "guardrails": [
    "no_pay_blocked_bills",
    "no_pay_unapproved",
    "budget_block_when_red"
  ]
}
