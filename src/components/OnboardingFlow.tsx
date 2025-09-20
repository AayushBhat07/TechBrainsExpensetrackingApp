import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

type OnboardingFlowProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfile: any | null;
};

const GOALS = [
  { key: "build_emergency_fund", label: "Build Emergency Fund", emoji: "💰" },
  { key: "save_major_purchase", label: "Save for Major Purchase", emoji: "🏠" },
  { key: "pay_off_debt", label: "Pay Off Debt", emoji: "💳" },
  { key: "track_reduce_spending", label: "Track & Reduce Spending", emoji: "📊" },
  { key: "invest_for_future", label: "Invest for Future", emoji: "📈" },
  { key: "manage_shared_expenses", label: "Manage Shared Expenses", emoji: "👥" },
] as const;

export default function OnboardingFlow({ open, onOpenChange, initialProfile }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Profile state
  const [financialGoal, setFinancialGoal] = useState<string | null>(initialProfile?.financialGoal ?? null);

  // Step 2 sub-fields
  const [emergencyMonths, setEmergencyMonths] = useState<number>(3);
  const [majorPurchaseAmount, setMajorPurchaseAmount] = useState<string>("");
  const [majorPurchaseTimeline, setMajorPurchaseTimeline] = useState<string>("6-12 months");
  const [debtAmount, setDebtAmount] = useState<string>("");
  const [debtType, setDebtType] = useState<string>("credit_card");
  const [concernCategory, setConcernCategory] = useState<string>("dining");
  const [investmentTimeline, setInvestmentTimeline] = useState<string>("3-10 years");
  const [collaborationType, setCollaborationType] = useState<string>("solo_manager");

  // Step 3 personality answers
  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string>("");
  const [q3, setQ3] = useState<string>("");
  const [q4, setQ4] = useState<string>("");
  const [q5, setQ5] = useState<string>("");

  // Derived archetypes
  const spendingPersonality = useMemo(() => {
    const map: Record<string, string> = {
      deliberate: "deliberate",
      impulse: "impulse",
      analytical: "analytical",
      disciplined: "disciplined",
    };
    if (q1.includes("Think")) return "deliberate_analytical";
    if (q1.includes("Buy")) return "impulse";
    if (q1.includes("Research")) return "analytical";
    if (q1.includes("Walk")) return "disciplined";
    return map.deliberate;
  }, [q1]);

  const motivationType = useMemo(() => {
    if (q4.includes("Achieving")) return "achievement_driven";
    if (q4.includes("progress")) return "data_driven";
    if (q4.includes("Challenges")) return "gamification_responsive";
    if (q4.includes("Peace")) return "stability_focused";
    return "achievement_driven";
  }, [q4]);

  // Step 4 baseline
  const [monthlyIncome, setMonthlyIncome] = useState<string>(initialProfile?.monthlyIncome ?? "");
  const [incomeVaries, setIncomeVaries] = useState<boolean>(false);
  const [typicalSpending, setTypicalSpending] = useState<string>("");
  const [essentialsPct, setEssentialsPct] = useState<number>(60);
  const [spendingConfidence, setSpendingConfidence] = useState<number>(5);

  // Step 5 categories
  const [preferredCategories, setPreferredCategories] = useState<string[]>(
    initialProfile?.preferredCategories ?? ["housing", "transportation", "groceries", "utilities", "dining", "subscriptions"]
  );
  const [watchCategory, setWatchCategory] = useState<string>("subscriptions");
  const [categoryRanges, setCategoryRanges] = useState<Record<string, string>>({});
  const [spendLessOn, setSpendLessOn] = useState<Record<string, boolean>>({});

  // Step 6 bank setup
  const [bankConnected, setBankConnected] = useState<boolean>(false);
  const [autoAlerts, setAutoAlerts] = useState<boolean>(true);

  const saveProfile = useMutation(api.onboarding.saveProfile);

  useEffect(() => {
    if (open) {
      // reset to step 1 for fresh open
      setStep(1);
    }
  }, [open]);

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    try {
      await saveProfile({
        financialGoal: financialGoal || "track_reduce_spending",
        spendingPersonality,
        motivationType,
        monthlyIncome: incomeVaries ? "varies" : monthlyIncome || "unknown",
        spendingConfidence,
        problemCategories: [concernCategory, watchCategory].filter(Boolean),
        collaborationType,
        preferredCategories,
        bankConnected,
        autoAlerts,
        emergencyMonths,
        majorPurchaseAmount: majorPurchaseAmount ? Number(majorPurchaseAmount) : undefined,
        majorPurchaseTimeline,
        debtAmount: debtAmount ? Number(debtAmount) : undefined,
        debtType,
        typicalSpending: typicalSpending ? Number(typicalSpending) : undefined,
        essentialsPct,
        onboardingCompleted: true,
      });
      toast("Onboarding complete! Your personal dashboard is ready.");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast("Something went wrong saving your profile. Please try again.");
    }
  };

  const ProgressBar = (
    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-black/70"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div
          className="w-full"
          style={{ background: "linear-gradient(135deg, #F5F3F0 0%, #FFF7E0 100%)" }}
        >
          <div className="p-5 border-b border-black/10">
            <div className="text-xs text-black/60 mb-2">Step {step} of {totalSteps}</div>
            {ProgressBar}
          </div>

          <div className="p-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">Your Personal Financial Journey Starts Here</h2>
                <p className="text-sm text-[#7F8C8D] mb-6">
                  In the next 3 minutes, we'll create your personalized financial blueprint.
                </p>
                <div className="rounded-xl border border-[#E8E8E8] bg-white/70 backdrop-blur-xl p-5 mb-4">
                  <div className="text-sm text-[#2C3E50]">
                    Imagine scattered receipts and charges gently organizing into neat categories and charts — that's MoneyTalks.
                  </div>
                </div>
                <div className="text-xs text-[#7F8C8D] mb-6">Bank‑level security • Your data stays private</div>
                <Button onClick={next} className="text-[#2C3E50]" style={{ background: "#F4D03F" }}>
                  Let's Begin
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">What's Your Main Financial Goal Right Now?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setFinancialGoal(g.key)}
                      className={`rounded-xl border p-4 text-left transition ${
                        financialGoal === g.key ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                      }`}
                    >
                      <div className="text-lg">{g.emoji} {g.label}</div>
                      <div className="text-xs text-[#7F8C8D] mt-1">
                        {
                          {
                            build_emergency_fund: "Create a safety net for unexpected expenses",
                            save_major_purchase: "House, car, vacation, or dream purchase",
                            pay_off_debt: "Eliminate credit cards, loans, or student debt",
                            track_reduce_spending: "Understand where your money goes each month",
                            invest_for_future: "Build long-term wealth and security",
                            manage_shared_expenses: "Track family or roommate spending together",
                          }[g.key]
                        }
                      </div>
                    </button>
                  ))}
                </div>

                {/* Goal-specific follow-ups */}
                <div className="mt-5 space-y-3">
                  {financialGoal === "build_emergency_fund" && (
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">How many months of expenses?</div>
                      <input
                        type="range"
                        min={3}
                        max={12}
                        value={emergencyMonths}
                        onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-[#7F8C8D] mt-1">{emergencyMonths} months</div>
                    </div>
                  )}

                  {financialGoal === "save_major_purchase" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-[#2C3E50] mb-1">Target amount</div>
                        <Input placeholder="e.g., 10000" value={majorPurchaseAmount} onChange={(e) => setMajorPurchaseAmount(e.target.value)} />
                      </div>
                      <div>
                        <div className="text-sm text-[#2C3E50] mb-1">Timeline</div>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 rounded-md"
                          value={majorPurchaseTimeline}
                          onChange={(e) => setMajorPurchaseTimeline(e.target.value)}
                        >
                          {["0-6 months", "6-12 months", "1-2 years", "2+ years"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {financialGoal === "pay_off_debt" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-[#2C3E50] mb-1">Total debt amount</div>
                        <Input placeholder="e.g., 8000" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} />
                      </div>
                      <div>
                        <div className="text-sm text-[#2C3E50] mb-1">Which bothers you most?</div>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 rounded-md"
                          value={debtType}
                          onChange={(e) => setDebtType(e.target.value)}
                        >
                          <option value="credit_card">Credit card</option>
                          <option value="student_loan">Student loan</option>
                          <option value="mortgage">Mortgage</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {financialGoal === "track_reduce_spending" && (
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">Which category concerns you most?</div>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={concernCategory}
                        onChange={(e) => setConcernCategory(e.target.value)}
                      >
                        <option value="dining">Dining</option>
                        <option value="shopping">Shopping</option>
                        <option value="subscriptions">Subscriptions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {financialGoal === "invest_for_future" && (
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">Investment timeline</div>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={investmentTimeline}
                        onChange={(e) => setInvestmentTimeline(e.target.value)}
                      >
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-10 years">3-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                  )}

                  {financialGoal === "manage_shared_expenses" && (
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">Who will you be sharing with?</div>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={collaborationType}
                        onChange={(e) => setCollaborationType(e.target.value)}
                      >
                        <option value="partner">Partner</option>
                        <option value="family">Family</option>
                        <option value="roommates">Roommates</option>
                        <option value="friends">Friends</option>
                        <option value="solo_manager">I prefer to handle finances myself</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button
                    className="text-[#2C3E50]"
                    style={{ background: "#F4D03F" }}
                    onClick={next}
                    disabled={!financialGoal}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Let's Understand Your Money Personality</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-[#2C3E50] mb-2">
                      When you see something you want but don't need, you usually...
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "🛑 Think it over for at least 24 hours",
                        "💳 Buy it if I have the money",
                        "🔍 Research prices and reviews first",
                        "❌ Walk away - I'm very disciplined",
                      ].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ1(t)}
                          className={`rounded-xl border p-3 text-left ${
                            q1 === t ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-[#2C3E50] mb-2">How do you currently track your expenses?</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "📱 I use apps and technology",
                        "🧾 I keep receipts and check statements",
                        "🤷 I don't really track them",
                        "💡 I have a mental budget in my head",
                      ].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ2(t)}
                          className={`rounded-xl border p-3 text-left ${
                            q2 === t ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-[#2C3E50] mb-2">Your biggest money stress is...</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "😰 Not knowing where my money goes",
                        "🎯 Not reaching my financial goals fast enough",
                        "🚨 Unexpected expenses that blow my budget",
                        "💸 Spending too much on things I don't need",
                      ].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ3(t)}
                          className={`rounded-xl border p-3 text-left ${
                            q3 === t ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-[#2C3E50] mb-2">You're most motivated by...</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "🏆 Achieving goals and milestones",
                        "📊 Seeing progress and data",
                        "🎮 Challenges and competitions",
                        "🧘 Peace of mind and security",
                      ].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ4(t)}
                          className={`rounded-xl border p-3 text-left ${
                            q4 === t ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-[#2C3E50] mb-2">When managing money with others, you prefer...</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "📋 Clear rules and shared tracking",
                        "💬 Regular discussions about spending",
                        "🏠 Separate accounts, occasional check-ins",
                        "👑 I prefer to handle finances myself",
                      ].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ5(t)}
                          className={`rounded-xl border p-3 text-left ${
                            q5 === t ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={next} disabled={!q1 || !q2 || !q3 || !q4 || !q5}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Help Us Understand Your Financial Situation</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-[#2C3E50] mb-1">Approximate monthly take-home income</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["<$2K", "$2K-4K", "$4K-6K", "$6K-10K", "$10K+"].map((r) => (
                        <button
                          key={r}
                          onClick={() => { setMonthlyIncome(r); setIncomeVaries(false); }}
                          className={`rounded-xl border p-3 ${
                            monthlyIncome === r && !incomeVaries ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                      <button
                        onClick={() => setIncomeVaries(true)}
                        className={`rounded-xl border p-3 ${
                          incomeVaries ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                        }`}
                      >
                        Varies significantly
                      </button>
                    </div>
                    <div className="text-xs text-[#7F8C8D] mt-1">This helps us provide relevant insights</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">Typical monthly spending (estimate is okay)</div>
                      <Input placeholder="e.g., 2500" value={typicalSpending} onChange={(e) => setTypicalSpending(e.target.value)} />
                    </div>
                    <div>
                      <div className="text-sm text-[#2C3E50] mb-1">Essentials vs. discretionary</div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={essentialsPct}
                        onChange={(e) => setEssentialsPct(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-[#7F8C8D] mt-1">{essentialsPct}% essentials • {100 - essentialsPct}% discretionary</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#2C3E50] mb-1">How confident are you about where your money goes?</div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={spendingConfidence}
                      onChange={(e) => setSpendingConfidence(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-[#7F8C8D] mt-1">Confidence: {spendingConfidence}/10</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={next}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Let's Set Up Your Personal Categories</h3>
                <div className="text-sm text-[#7F8C8D] mb-3">Tap to toggle categories you care about.</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["housing","🏠 Housing"],
                    ["transportation","🚗 Transportation"],
                    ["groceries","🛒 Groceries & Food"],
                    ["utilities","⚡ Utilities & Bills"],
                    ["dining","🍽️ Dining Out"],
                    ["entertainment","🎬 Entertainment"],
                    ["shopping","👕 Shopping & Clothing"],
                    ["health_fitness","💪 Health & Fitness"],
                    ["subscriptions","📱 Subscriptions"],
                  ].map(([key, label]) => {
                    const active = preferredCategories.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setPreferredCategories((prev) =>
                            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          active ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {preferredCategories.slice(0, 6).map((c) => (
                    <div key={c} className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                      <div className="text-sm text-[#2C3E50] mb-1">Typical monthly spend on {c}?</div>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        value={categoryRanges[c] ?? ""}
                        onChange={(e) => setCategoryRanges((s) => ({ ...s, [c]: e.target.value }))}
                      >
                        <option value="">Select a range</option>
                        {["<$100", "$100-$250", "$250-$500", "$500-$1000", "$1000+"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-[#7F8C8D]">Spend less here?</div>
                        <input
                          type="checkbox"
                          checked={!!spendLessOn[c]}
                          onChange={(e) => setSpendLessOn((s) => ({ ...s, [c]: e.target.checked }))}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="text-sm text-[#2C3E50] mb-1">Which expense always surprises you at the end of the month?</div>
                  <Input
                    placeholder="e.g., subscriptions, ride-sharing, takeout..."
                    value={watchCategory}
                    onChange={(e) => setWatchCategory(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={next}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Connect Your Accounts for Automatic Insights</h3>
                <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-4 mb-4">
                  <div className="text-sm text-[#2C3E50]">We use bank‑level security and read‑only access. We'll never move money.</div>
                  <div className="text-xs text-[#7F8C8D] mt-1">We partner with Plaid, trusted by millions.</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setBankConnected(true)}
                    className={`rounded-xl border p-4 text-left ${
                      bankConnected ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                    }`}
                  >
                    <div className="text-lg">Connect My Bank Account (Recommended)</div>
                    <div className="text-xs text-[#7F8C8D] mt-1">
                      Immediate categorization and tailored insights
                    </div>
                  </button>
                  <button
                    onClick={() => setBankConnected(false)}
                    className={`rounded-xl border p-4 text-left ${
                      !bankConnected ? "border-[#2C3E50] bg-white" : "border-[#E8E8E8] bg-white/70"
                    }`}
                  >
                    <div className="text-lg">I'll Add Expenses Manually</div>
                    <div className="text-xs text-[#7F8C8D] mt-1">We'll remind you later and show a quick tutorial</div>
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                  <div className="text-sm text-[#2C3E50]">Set automatic alerts when you exceed typical amounts?</div>
                  <input type="checkbox" checked={autoAlerts} onChange={(e) => setAutoAlerts(e.target.checked)} />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={next}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Your Personalized Financial Dashboard is Ready!</h3>
                <div className="text-sm text-[#7F8C8D] mb-4">
                  Here are a few quick insights tailored to you.
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                    <div className="text-sm text-[#2C3E50]">
                      You'll get alerts for {watchCategory || "your watch category"} if spending spikes.
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                    <div className="text-sm text-[#2C3E50]">
                      Motivation style: {motivationType.replace(/_/g, " ")} • Personality: {spendingPersonality.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E8E8E8] bg-white/70 p-3">
                    <div className="text-sm text-[#2C3E50]">
                      Goal: {financialGoal ? GOALS.find(g => g.key === financialGoal)?.label : "Track & Reduce Spending"}
                    </div>
                  </div>
                </div>

                <div className="text-sm mt-5">First achievements to unlock:</div>
                <ul className="list-disc pl-5 text-sm text-[#2C3E50] mt-1">
                  <li>Set a budget alert for {concernCategory}</li>
                  <li>Log your next expense to train AI categorization</li>
                  <li>{collaborationType === "solo_manager" ? "Invite a partner/friend later" : "Invite your collaborators"}</li>
                </ul>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" className="border-[#E8E8E8]" onClick={back}>Back</Button>
                  <Button className="text-[#2C3E50]" style={{ background: "#F4D03F" }} onClick={handleFinish}>
                    Start Your First Week
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}