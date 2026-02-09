import Env from "react-native-config";

export default {
  BUILD_VARIANT: Env.BUILD_VARIANT || "client",
  PRIMARY_COLOR: Env.PRIMARY_COLOR || "#25CD7C",
  SECONDARY_COLOR: Env.SECONDARY_COLOR || "#C6F5D9",
  BORDER_COLOR: Env.BORDER_COLOR || "#3AE27C",
  BUTTON_COLOR: Env.BUTTON_COLOR || "#2DDF89",
  EXAMPLE_THEME_COLOR: Env.EXAMPLE_THEME_COLOR || "#18C16E",
  INFO_BOX_THEME_COLOR: Env.INFO_BOX_THEME_COLOR || "#08CA6B",
  SIGN_IN_TEXT_COLOR: Env.SIGN_IN_TEXT_COLOR || "#02BB71",
  HEADER_THREE_TEXT_COLOR: Env.HEADER_THREE_TEXT_COLOR || "#000000",
  BULLET_COLOR: Env.BULLET_COLOR || "#515151",
  TERMS_AND_CONDITIONS:
    Env.TERMS_AND_CONDITIONS ||
    "https://www.avomd.io/subscriptionagreementandtermsofuse",
  PRIVACY_POLICY: Env.PRIVACY_POLICY || "https://www.avomd.io/privacypolicy",
  QUESTIONNAIRE_MESSAGE:
    Env.QUESTIONNAIRE_MESSAGE ||
    "Almost done! Answering these quick questions will help us personalize your experience.",
  ON_BOARD_TITLE_LINE_1:
    Env.ON_BOARD_TITLE_LINE_1 || "Columbia Psychiatry Pathways",
  ON_BOARD_TITLE_LINE_2: Env.ON_BOARD_TITLE_LINE_2 || "Powered By AvoMD",
  TRY_ONCE_AVAILABLE: Env.TRY_ONCE_AVAILABLE || false,
  SHOW_CHANNEL_SCREEN: Env.SHOW_CHANNEL_SCREEN || false,
  AUTHER_DESCRIPTION: Env.AUTHER_DESCRIPTION || "Dr. Steven Cohn et al.",
  CHANNELS: JSON.parse(Env.CHANNELS) || [],
  PLACEHOLDER_MODULES: JSON.parse(Env.PLACEHOLDER_MODULES) || [
    { title: "Preoperative Pulmonary Evaluation", author: "Team AvoMD at al," },
    {
      title: "Preoperative Evaluation (for inpatient)",
      author: "Team AvoMD at al,",
    },
  ],
  SUBSCRIPTION_DURATION_MONTH: Env.SUBSCRIPTION_DURATION_MONTH || 12,
  AUTHOR_LIST: JSON.parse(Env.AUTHOR_LIST) || [
    {
      name: "Columbia Psychiatry Department",
      authorType: "Corresponding Author",
      photo: "photo_cohn",
      description:
        "Ranked #3 in NIH funding and in the top 5 psychiatry hospitals in the country by US News, the Department of Psychiatry at Columbia University has been a preeminent academic psychiatry department for over 100 years. Columbia Psychiatry faculty have led the development of the Diagnostic and Statistical Manual of Mental Disorders (DSM) and served as leaders in the field including the current National Institutes of Mental Health Director. The inventors of this clinical algorithm are J. John Mann, MD, co-director of Columbia\u2019s Center for the Prevention and Treatment of depression and a leading researcher in the field of mood disorders, and Ravi N. Shah, MD, MBA, a pioneer in digital mental health and the department\u2019s Chief Innovation Officer.",
    },
  ],
  PRICE: JSON.parse(
    Env.PRICE || { individual: "19.99", institutional: "14.99" }
  ),
  REDEEM_CODES: JSON.parse(Env.REDEEM_CODES) || [],
  PAYMENT_PLANS: JSON.parse(Env.PAYMENT_PLANS) || [
    {
      title: "Individual Subscription",
      subTitle: "$19.99/year after trial ends",
      price: "19.99",
    },
    {
      title: "Institutional Subscription",
      subTitle: "$14.99/year after trial ends",
      price: "14.99",
    },
    { title: "Redeem Code", subTitle: "Use a promo code" },
  ],
  ANALYTICS_API_KEY:
    Env.ANALYTICS_API_KEY || "581aebccbe6ff973d4a3fa2cb82bcf32",
  IS_LIVE_DB: Env.IS_LIVE,
  CLOUD_FUNCTION_API_KEY:
    Env.CLOUD_FUNCTION_API_KEY || "AIzaSyBRCaegaBgoRHGTG0cL9GhnKTnq4O2131D",
  MIXPANEL_PROJECT_TOKEN:
    Env.MIXPANEL_PROJECT_TOKEN || "5eb62b294f20d566b65600bd7afdc6b2", // fallback to dev token
  CLIENT_ID: "com.synapticmed.siabg2016",
  CLIENT_SECRET:
    "eyJhbGciOiJFUzI1NiIsImtpZCI6IjRCMjhNOTIzRkgifQ.eyJhdWQiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiaXNzIjoiQzNHQ0c2UVo4NSIsImlhdCI6MTY3NDE5NzgyNCwiZXhwIjoxNjg5NzQ5ODI1LCJzdWIiOiJjb20uc3luYXB0aWNtZWQuc2lhYmcyMDE2In0.swy0MX9gzUZKyDoKGKge4B3gDqq4mkw5dXtTAeEy6USAecJ6HxQBtVvnZRgarGjwu6iG7su_dt_tc6VR9Y1qAQ",
};
