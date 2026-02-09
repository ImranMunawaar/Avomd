export const testLink = {
  usingDeepLinkTest: false, // note: ALWAYS set to false before releasing,
  pureJS: true,
  cds: {
    path: "cds",
    testingParameters: {
      //bypassCredential: "samsung",
      targetModule: "abg_smc",
      data: [
        {
          code: "2744-1",
          value: 7.6
        },
        {
          code: "2019-8",
          value: 20
        },
        {
          code: "2028-9",
          value: 15.6
        },
        {
          code: "2951-2",
          value: 138
        },
        {
          code: "2075-0",
          value: 104
        }
      ]
    }
  },
  testmodule: {
    path: "testmodule",
    testingParameters: {
      code: "miscpublic"
    }
  },
  enterprise: {
    path: "enterprise",
    testingParameters: {
      email: "drpajama@gmail.com",
      password: "pc386pc386",
      subscriptions: ["pmpediatrics"]
    }
  },
  subscribeChannel: {
    path: "subscribeChannel",
    testingParameters: {
      code: "avomd_public"
    }
  }
};
