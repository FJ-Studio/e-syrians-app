export type CreditStatus =
  | "available"
  | "creating"
  | "pending"
  | "in_review"
  | "approved"
  | "declined"
  | "expired"
  | "revoked";
export type VerificationCredit = {
  uuid: string;
  status: CreditStatus;
  can_gift: boolean;
};

export type VerificationSummary = {
  can_purchase?: boolean;
  price_minor?: number;
  currency?: string;
  provider_ready: boolean;
  can_claim: boolean;
  credits: VerificationCredit[];
};

export type GiftCode = { code: string; expires_at: string };
export type VerificationPayload = VerificationSummary | GiftCode | { url: string };

export type VerificationCreditHistory = {
  items: { id: number; event: string; occurred_at: string }[];
  page: number;
  last_page: number;
};

export function creditHistoryDelta(event: string): -1 | 0 | 1 {
  switch (event) {
    case "gift_sent":
      return -1;
    case "gift_received":
    case "admin_granted":
    case "purchased":
    case "claimed":
      return 1;
    default:
      return 0;
  }
}

/** Group a page in its existing order, using the same time zone for headings and times. */
export function creditHistoryDays(items: VerificationCreditHistory["items"], locale: string, timeZone?: string) {
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone });
  const timeFormat = new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone });
  const days: { date: string; items: (VerificationCreditHistory["items"][number] & { time: string })[] }[] = [];
  for (const item of items) {
    const date = new Date(item.occurred_at);
    const label = dateFormat.format(date);
    const last = days[days.length - 1];
    const entry = { ...item, time: timeFormat.format(date) };
    if (last?.date === label) last.items.push(entry);
    else days.push({ date: label, items: [entry] });
  }
  return days;
}

export function verificationState({ credits }: VerificationSummary) {
  const available = credits.filter((credit) => credit.status === "available");
  const giftable = available.find((credit) => credit.can_gift);
  // The API orders credits newest first. An active attempt always takes
  // precedence over unused credits and historical decisions.
  const active = credits.find(
    (credit) => credit.status === "creating" || credit.status === "pending" || credit.status === "in_review",
  );
  const decision = credits.find((credit) => ["approved", "declined", "expired"].includes(credit.status));
  return {
    balance: available.length,
    next: available[0],
    giftable,
    current: active ?? decision ?? available[0],
  };
}

export const verificationCopy = (locale: string, live = false) => {
  const ar = locale === "ar";
  const number = (count: number) => new Intl.NumberFormat(ar ? "ar" : "en").format(count);
  const copy = {
    title: ar ? "التحقق من الهوية" : "ID verification",
    startAnother: ar ? "ابدأ تحققًا تجريبيًا آخر" : "Start another test",
    useOnly: ar
      ? "يمكنك استخدام الرصيد المتاح للتحقق من هويتك، لكن لا يمكنك إهداؤه."
      : "You can use your available credits for verification, but you can’t gift them.",
    historyTitle: ar ? "سجلّ الأرصدة" : "Credit history",
    historyEmpty: ar ? "لا توجد عمليات على الأرصدة بعد." : "No credit activity yet.",
    historyNote: ar
      ? "الأرصدة التجريبية التي حصلت عليها أو أهديتها."
      : "Test credits added to or sent from your account.",
    historyLoading: ar ? "جارٍ تحميل سجلّ الأرصدة…" : "Loading credit activity…",
    historyFailed: ar ? "تعذّر تحميل سجلّ الأرصدة." : "Couldn’t load credit activity.",
    previousPage: ar ? "السابق" : "Previous",
    nextPage: ar ? "التالي" : "Next",
    historyChange: (delta: -1 | 1) => ({
      value: `${delta > 0 ? "+" : "−"}${number(1)}`,
      label: delta > 0 ? (ar ? "أُضيف رصيد واحد" : "One credit added") : ar ? "خُصم رصيد واحد" : "One credit removed",
    }),
    historyPage: (page: number, total: number) =>
      ar ? `صفحة ${number(page)} من ${number(total)}` : `Page ${number(page)} of ${number(total)}`,
    historyEvent: (event: string) => {
      switch (event) {
        case "gift_sent":
          return ar ? "أرسلت رصيدًا هديةً" : "Gift sent";
        case "gift_received":
          return ar ? "استلمت رصيدًا هديةً" : "Gift received";
        case "admin_granted":
          return ar ? "رصيد من إدارة المنصّة" : "Granted by an admin";
        case "purchased":
          return ar ? "اشتريت رصيدًا" : "Credit purchased";
        case "claimed":
          return ar ? "حصلت على رصيد تجريبي مجاني" : "Free test credit claimed";
        default:
          return ar ? "عملية على الرصيد" : "Credit activity";
      }
    },
    intro: ar
      ? "تتولّى Didit التحقق من هويتك. هذا الإجراء منفصل عن التوثيق المجتمعي."
      : "Didit handles the ID check. This is separate from community verification.",
    back: ar ? "العودة إلى الحساب" : "Back to Account",
    test: ar ? "الوضع التجريبي" : "Test mode",
    safety: ar
      ? "استخدم وثيقة تجريبية فقط، ولا ترفع هويتك أو صورتك الشخصية. لن يُخصم منك أي مبلغ."
      : "Use a sample document only. Don’t upload a real ID or selfie. No payment is collected.",
    noCredit: ar ? "لا يوجد رصيد" : "No credit",
    needCredit: ar ? "تحتاج إلى رصيد لإجراء التحقق" : "You need one credit to verify",
    getCredit: ar
      ? "كل رصيد يكفي لمحاولة تحقق واحدة. يمكنك الحصول على رصيد تجريبي مجاني."
      : "One credit covers one ID check. You can claim a free credit in test mode.",
    giftOnly: ar
      ? "كل رصيد يكفي لمحاولة تحقق واحدة. يمكنك استلام رصيد من شخص آخر."
      : "One credit covers one ID check. You can receive a credit from someone else.",
    creditAvailable: ar ? "رصيد متاح" : "Credit available",
    balance: (count: number) =>
      !ar
        ? `${number(count)} ${count === 1 ? "credit" : "credits"} available`
        : count === 1
          ? "رصيد واحد متاح"
          : count === 2
            ? "رصيدان متاحان"
            : count >= 3 && count <= 10
              ? `${number(count)} أرصدة متاحة`
              : `${number(count)} رصيدًا متاحًا`,
    prepare: ar
      ? "كل رصيد يكفي لمحاولة تحقق واحدة. جهّز وثيقة تجريبية قبل أن تبدأ."
      : "One credit covers one ID check. Have a sample document ready before you start.",
    openInTab: ar ? "ستفتح Didit في تبويب جديد." : "Didit opens in a new tab.",
    claim: ar ? "احصل على رصيد تجريبي مجاني" : "Claim a free test credit",
    verify: ar ? "تحقّق من هويتك" : "Verify your ID",
    start: ar ? "ابدأ التحقق" : "Start verification",
    resume: ar ? "تابع التحقق" : "Continue verification",
    progress: ar ? "قيد التحقق" : "In progress",
    progressTitle: ar ? "لم يكتمل التحقق بعد" : "Verification in progress",
    progressBody: ar
      ? "تابع من حيث توقّفت في Didit. لن يُخصم رصيد آخر."
      : "Pick up where you left off in Didit. Continuing won’t use another credit.",
    openDidit: ar ? "افتح Didit" : "Open Didit",
    review: ar ? "بانتظار النتيجة" : "Awaiting decision",
    reviewTitle: ar ? "طلب التحقق قيد المراجعة" : "Your check is being reviewed",
    reviewBody: ar
      ? "تراجع Didit الوثيقة التجريبية. ستظهر النتيجة هنا عندما تصبح جاهزة."
      : "Didit is reviewing the sample document. The result will appear here when it’s ready.",
    check: ar ? "تحقّق من النتيجة" : "Check result",
    lastChecked: (time: string) => (ar ? `آخر تحقق: ${time}` : `Last checked ${time}`),
    viewResult: ar ? "اعرض النتيجة" : "View result",
    viewStatus: ar ? "اعرض الحالة" : "View status",
    approved: ar ? "نجح الاختبار" : "Test approved",
    approvedTitle: ar ? "نجحت عملية التحقق التجريبية" : "Your test ID check was approved",
    approvedBody: ar
      ? "وافقت Didit على الوثيقة التجريبية. لا تغيّر هذه النتيجة حالة توثيق حسابك."
      : "Didit approved the sample document. This result doesn’t change your account’s verification status.",
    declined: ar ? "لم ينجح الاختبار" : "Not approved",
    declinedTitle: ar ? "لم تنجح عملية التحقق التجريبية" : "Your test ID check wasn’t approved",
    declinedBody: ar
      ? "لم توافق Didit على الوثيقة التجريبية. تحتاج إلى رصيد آخر للمحاولة مجددًا."
      : "Didit didn’t approve the sample document. You’ll need another credit to try again.",
    retry: ar ? "حاول مجددًا" : "Try again",
    gifts: ar ? "الهدايا" : "Gifts",
    receive: ar ? "استلم هدية" : "Receive a gift",
    receiveBody: ar
      ? "شارك رمزًا خاصًا مع من يرغب في إهدائك رصيدًا."
      : "Share a private code with someone who wants to send you a credit.",
    receiveDetails: ar
      ? "يمكن استخدام الرمز مرة واحدة فقط. شاركه مع الشخص الذي سيرسل إليك الرصيد."
      : "This code can be used once. Share it only with the person sending you a credit.",
    expires: (time: string) => (ar ? `ينتهي عند ${time}` : `Expires at ${time}`),
    generate: ar ? "أنشئ رمزًا" : "Generate code",
    newCode: ar ? "أنشئ رمزًا جديدًا" : "Generate new code",
    copy: ar ? "انسخ الرمز" : "Copy code",
    copied: ar ? "نُسخ الرمز" : "Copied",
    share: ar ? "شارك الرمز" : "Share code",
    gift: ar ? "أهدِ رصيدًا" : "Gift a credit",
    giftBody: ar ? "أدخل رمز الاستلام الذي شاركه معك المستلِم." : "Enter the gift code your recipient shared with you.",
    giftDetails: ar
      ? "سينتقل رصيد تجريبي واحد من حسابك إلى المستلِم."
      : "One test credit will move from your account to the recipient.",
    giftCode: ar ? "رمز استلام الهدية" : "Gift code",
    noGift: ar ? "لا يوجد لديك رصيد قابل للإهداء." : "You don’t have a credit you can gift.",
    send: ar ? "أرسل الرصيد" : "Send credit",
    sent: ar ? "أُرسل الرصيد." : "Credit sent.",
    invalidCode: ar ? "رمز الهدية غير صالح أو انتهت صلاحيته." : "This gift code is invalid or has expired.",
    conflict: ar
      ? "تغيّر رصيدك أو حالة التحقق. تحقّق من الحالة الحالية وحاول مجددًا."
      : "Your balance or verification status changed. Check the current status and try again.",
    close: ar ? "إغلاق" : "Close",
    loading: ar ? "جارٍ تحميل حالة التحقق…" : "Loading verification status…",
    unavailable: ar ? "التجربة غير متاحة لهذا الحساب." : "Test mode is not available for this account.",
    providerUnavailable: ar
      ? "خدمة التحقق التجريبية غير متاحة حاليًا."
      : "The test verification service isn’t available right now.",
    failed: ar ? "تعذّر إكمال العملية. حاول مجددًا." : "Could not complete the action. Please try again.",
  };
  return {
    ...copy,
    ...(live && {
      test: ar ? "التحقق من وثيقة رسمية" : "Government-issued ID",
      safety: ar
        ? "ستنتقل إلى Didit لتقديم وثيقة هويتك وإكمال الفحوص المطلوبة. التحقق من الهوية منفصل عن التوثيق المجتمعي."
        : "You’ll go to Didit to submit your ID and complete the required checks. This does not change community verification.",
      historyNote: ar
        ? "عمليات الشراء والهدايا والأرصدة الممنوحة لهذا الحساب."
        : "Purchases, gifts, and grants for this account.",
      prepare: ar
        ? "جهّز وثيقة هويتك. يغطي كل رصيد عملية تحقق واحدة."
        : "Have your ID ready. One credit covers one check.",
      startAnother: ar ? "ابدأ عملية تحقق أخرى" : "Start another check",
      reviewBody: ar
        ? "تراجع Didit طلبك. ستظهر النتيجة هنا عندما تصبح جاهزة."
        : "Didit is reviewing your check. The result will appear here when it’s ready.",
      approved: ar ? "تمت الموافقة" : "Approved",
      approvedTitle: ar ? "تمت الموافقة على طلب التحقق من هويتك" : "Your ID check was approved",
      approvedBody: ar
        ? "وافقت Didit على طلبك. لا تغيّر النتيجة حالة التوثيق المجتمعي."
        : "Didit approved your check. This does not change your community verification status.",
      declinedTitle: ar ? "لم تتم الموافقة على طلب التحقق" : "Your ID check wasn’t approved",
      declinedBody: ar
        ? "لم توافق Didit على طلبك. تحتاج إلى رصيد آخر للمحاولة مجددًا."
        : "Didit didn’t approve this check. You’ll need another credit to try again.",
      giftDetails: ar
        ? "سينتقل رصيد واحد من حسابك إلى المستلِم."
        : "One credit will move from your account to the recipient.",
      unavailable: ar ? "التحقق من الهوية غير متاح لهذا الحساب." : "ID verification is not available for this account.",
      providerUnavailable: ar
        ? "خدمة التحقق من الهوية غير متاحة حاليًا."
        : "ID verification is temporarily unavailable.",
    }),
    consent: ar ? "أوافق على المتابعة إلى Didit للتحقق من هويتي." : "I agree to continue to Didit for my ID check.",
    expired: ar ? "انتهت صلاحية الطلب" : "Check expired",
    expiredBody: ar
      ? "انتهت مهلة إكمال التحقق. تحتاج إلى رصيد آخر للمحاولة مجددًا."
      : "The check expired before it was completed. You’ll need another credit to try again.",
    buy: (price: string) => (ar ? `اشترِ رصيدًا مقابل ${price}` : `Buy one credit · ${price}`),
    buyDetails: ar
      ? "يمكنك استخدام الرصيد بنفسك أو إهداؤه مرة واحدة قبل بدء التحقق. الشراء لا يضمن الموافقة."
      : "Use the credit yourself or gift it once before starting a check. Purchase does not guarantee approval.",
    checkoutPending: ar ? "بانتظار تأكيد الدفع من Stripe…" : "Waiting for Stripe to confirm your payment…",
    checkoutPaid: ar ? "تم الدفع وإضافة الرصيد إلى حسابك." : "Payment confirmed. Your credit is ready.",
    checkoutCancelled: ar
      ? "لم تُكمل الدفع. يمكنك العودة إلى صفحة الدفع."
      : "Checkout was not completed. You can return to it.",
    checkoutClosed: ar
      ? "لم يُضَف رصيد لهذه العملية. تحقّق من سجلّ الدفع أو تواصل معنا إذا خُصم منك مبلغ."
      : "No credit was added for this order. Check your payment record or contact support if you were charged.",
    checkoutCheck: ar ? "تحقّق من الدفع" : "Check payment status",
  };
};

export function entryAction(state: ReturnType<typeof verificationState>, copy: ReturnType<typeof verificationCopy>) {
  switch (state.current?.status) {
    case "creating":
    case "pending":
      return copy.resume;
    case "in_review":
      return copy.viewStatus;
    case "approved":
      return state.balance > 0 ? copy.startAnother : copy.viewResult;
    case "expired":
    case "declined":
      return copy.viewResult;
    default:
      return copy.verify;
  }
}

export function giftUnavailableReason(
  state: ReturnType<typeof verificationState>,
  copy: ReturnType<typeof verificationCopy>,
) {
  if (state.giftable) return undefined;
  return state.balance > 0 ? copy.useOnly : copy.noGift;
}

export function verificationCard(summary: VerificationSummary, copy: ReturnType<typeof verificationCopy>) {
  const { current, balance, next } = verificationState(summary);
  const claim = summary.can_claim ? { kind: "claim" as const, label: copy.claim } : undefined;
  switch (current?.status) {
    case "creating":
    case "pending":
      return {
        status: copy.progress,
        title: copy.progressTitle,
        body: copy.progressBody,
        tone: "progress" as const,
        action: { kind: "start" as const, credit: current.uuid, label: copy.resume },
      };
    case "in_review":
      return {
        status: copy.review,
        title: copy.reviewTitle,
        body: copy.reviewBody,
        tone: "progress" as const,
        action: { kind: "refresh" as const, credit: current.uuid, label: copy.check },
      };
    case "approved":
      return {
        status: copy.approved,
        title: copy.approvedTitle,
        body: copy.approvedBody,
        tone: "success" as const,
        action: next ? { kind: "start" as const, credit: next.uuid, label: copy.startAnother } : undefined,
      };
    case "declined":
      return {
        status: copy.declined,
        title: copy.declinedTitle,
        body: copy.declinedBody,
        tone: "warning" as const,
        action: next ? { kind: "start" as const, credit: next.uuid, label: copy.retry } : claim,
      };
    case "expired":
      return {
        status: copy.expired,
        title: copy.expired,
        body: copy.expiredBody,
        tone: "warning" as const,
        action: next ? { kind: "start" as const, credit: next.uuid, label: copy.retry } : undefined,
      };
    case "available":
      return {
        status: copy.creditAvailable,
        title: copy.balance(balance),
        body: copy.prepare,
        tone: "brand" as const,
        action: { kind: "start" as const, credit: current.uuid, label: copy.start },
      };
    default:
      return {
        status: copy.noCredit,
        title: copy.needCredit,
        body: claim ? copy.getCredit : copy.giftOnly,
        tone: "neutral" as const,
        action: claim,
      };
  }
}

export function verificationError(status: number, copy: ReturnType<typeof verificationCopy>, action?: string) {
  if (action === "gift" && status === 422) return copy.invalidCode;
  if (!action && status === 404) return copy.unavailable;
  if (status === 409) return copy.conflict;
  if (status === 503) return copy.providerUnavailable;
  return copy.failed;
}
