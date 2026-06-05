export default {
  admin: {
    panel: 'ადმინ პანელი', logout: 'გასვლა',
    nav: { dashboard: 'პანელი', bankReview: 'ბანკის განხილვა', auditCenter: 'აუდიტი', security: 'უსაფრთხოება', dataGov: 'მონაცემები', continuity: 'უწყვეტობა', users: 'მომხმარებლები', kyc: 'KYC', applications: 'განაცხადები', finance: 'ფინანსები', crystal: 'CRYSTAL', production: 'წარმოება', analytics: 'ანალიტიკა', auditLog: 'აუდიტ ლოგი', settings: 'პარამეტრები' },
    applications: { subtitle: 'განაცხადების მართვა', totalApplications: 'სულ განაცხადები', pendingReview: 'მოლოდინში', approved: 'დამტკიცებული', totalFunds: 'სულ თანხა', inProduction: 'წარმოებაში', searchPlaceholder: 'ძებნა ID ან სახელით...', allStatus: 'ყველა სტატუსი', headers: { id: 'ID', user: 'მომხმარებელი', coin: 'მონეტა', qty: 'რაოდ.', value: 'ღირებულება', status: 'სტატუსი', crystal: 'CRYSTAL', actions: 'მოქმედება' }, verify: 'ვერიფიკაცია', suspend: 'შეჩერება', coinType: 'მონეტის ტიპი', totalValue: 'სულ' },
    users: { subtitle: 'მომხმარებლები', totalUsers: 'სულ', pendingKyc: 'KYC მოლოდინში', exportCsv: 'CSV ექსპორტი', searchPlaceholder: 'ძებნა...', headers: { mergeId: 'MERGE ID', name: 'სახელი', email: 'ელფოსტა', phone: 'ტელეფონი', kyc: 'KYC', status: 'სტატუსი', joined: 'რეგისტრაცია', actions: 'მოქმედება' } },
    settings: { subtitle: 'სისტემის კონფიგურაცია', title: 'პარამეტრები' },
    statuses: { underReview: 'განხილვაში', approved: 'დამტკიცებული', sentToCrystal: 'Crystal-ზე', fundsReceived: 'თანხა მიღებულია', inProduction: 'წარმოებაში' },
  },
} as const
