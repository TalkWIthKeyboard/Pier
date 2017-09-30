var pathName = {
  adsApps: '\\\\bingdrops\\AdsTestCloud\\Logs\\AdsApps\\',
  biApps: '\\\\bingdrops\\AdsTestCloud\\Logs\\BIApps\\',
  biAppsCCmain: '\\\\bingdrops\\AdsTestCloud\\Logs\\BIApps\\9974\\',
  BiAppsBillingmain: '\\\\bingdrops\\AdsTestCloud\\Logs\\BIApps\\10813\\',
  biAppsCCAdhoc: '\\\\bingdrops\\AdsTestCloud\\Logs\\BIApps\\10054\\',
  ucmFull: '\\\\bingdrops\\AdsTestCloud\\Logs\\UCM\\9921',
  ccmtSI: '\\\\bingdrops\\AdsApps\\User\\DailyShipping\\TestcaseTrxOfSI\\',
  billingSI: '\\\\bingdrops\\AdsApps\\User\\DailyShipping\\TestcaseTrxOfSI\\'
};

var commonTrxPatternForSI = 'tmiRun';
var nameStatsMsSqlForBilling = 'billing_si';
var nameStatsMsSqlForCCMT = 'ccmt_si';

/**
 * Optional: fileNameContains, insertStatsMsSql, nameStatsMsSql
 */
function generateConfigDefault(container, envName, nameDisplay, fileNameContains, insertStatsMsSql, nameStatsMsSql, title) {
  return {
    container: container,
    depth: 1,
    name: envName,
    nameDisplay: nameDisplay,
    fileNameContains: fileNameContains,
    displayUI: true,
    hasBuildNumber: false,
    detailFromLogs: true,
    insertStatsMsSql: insertStatsMsSql || false,
    nameStatsMsSql: insertStatsMsSql && nameStatsMsSql || 'unknown',
    title: title
  };
}


function createDefaultConfigGenerator(basePath, insertStatsMsSql, nameStatsMsSql, title) {
  return (envName, nameDisplay, fileNameContains) => {
    return generateConfigDefault(basePath, envName, nameDisplay, fileNameContains, insertStatsMsSql, nameStatsMsSql, title);
  }
}


function createSIConfigGenerator(insertStatsMsSql, nameStatsMsSql, title) {
  return (container, envName) => {
    return generateConfigDefault(container, envName, 'SI ' + envName, commonTrxPatternForSI, insertStatsMsSql, nameStatsMsSql, title);
  }
}

function createReleaseConfigGenerator(insertStatsMsSql) {
  return (container, envName, nameDisplay, nameStatsMsSql, title) => {
    return generateConfigDefault(container, envName, nameDisplay, envName, insertStatsMsSql, nameStatsMsSql, title);
  };
}

var CCMTRegularFFTPConfigGenerator = createDefaultConfigGenerator('bi-apps-ccmain', true, 'ccmt', 'CCMT Regular FFTP');
var CCMTSIConfigGenerator = createSIConfigGenerator(true, nameStatsMsSqlForCCMT, 'CCMT SI');

var BillingRegularFFTPConfigGenerator = createDefaultConfigGenerator('bi-apps-billingmain', true, 'billing', 'Billing Regular FFTP');
var BillingSIConfigGenerator = createSIConfigGenerator(true, nameStatsMsSqlForBilling, 'Billing SI');

var ReleaseConfigGenerator = createReleaseConfigGenerator(true);
var CampaignDbCiGenerator = createDefaultConfigGenerator('campaign-db-ci', true, 'campaign-db-ci', 'Campaign DB CI');

module.exports = {
  fftp: {
    container: 'fftp',
    depth: 1,
    name: 'fftp',
    nameDisplay: 'CCUI FFTP',
    hasBuildNumber: true,
    displayUI: true,
    detailFromLogs: true,
    insertStatsMsSql: true,
    nameStatsMsSql: 'ccui_staging',
    title: 'CCUI'
  },
  fftp_ccui_fast: {
    container: 'fftp-ccui-fast',
    depth: 1,
    name: 'fftp_ccui_fast',
    nameDisplay: 'CCUI - 2 Machines Gated',
    hasBuildNumber: false,
    insertStatsMsSql: false,
    displayUI: true,
    detailFromLogs: true,
    title: 'CCUI'
  },
  fftp_ccui_scheduled: {
    container: 'fftp-ccui-scheduled',
    depth: 1,
    name: 'fftp_ccui_scheduled',
    nameDisplay: 'CCUI FFTP Scheduled',
    hasBuildNumber: true,
    displayUI: true,
    select: true,
    detailFromLogs: true,
    insertStatsMsSql: true,
    nameStatsMsSql: 'fftp',
    title: 'CCUI'
  },
  si: generateConfigDefault('si-data', 'si', 'CCUI SI', 'CCUI', true, 'ccui_si', 'CCUI'),

  //UCM
  ucm_web_full: generateConfigDefault('ucm-full', 'ucm_web_full', 'UCMWeb', 'UCMWeb', true, 'ucm_web', 'UCM'),
  ucm_db_full: generateConfigDefault('ucm-full', 'ucm_db_full', 'UCMDB', 'UCMDB', true, 'ucm_backend', 'UCM'),
  ucm_mt_full: generateConfigDefault('ucm-full', 'ucm_mt_full', 'UCMMT', 'UCMMT', true, 'ucm_backend', 'UCM'),
  ucm_sim_full: generateConfigDefault('ucm-full', 'ucm_sim_full', 'UCMSIM', 'UCMSIM', true, 'ucm_backend', 'UCM'),
  //UCM CloudTest
  ucm_cloudtest_api: generateConfigDefault('ucm-vsts-cloudtest', 'ucm_cloudtest_api', 'UCM CloudTest API', 'API', true, 'ucm_cloudtest', 'UCM Cloud Test'),
  ucm_cloudtest_db: generateConfigDefault('ucm-vsts-cloudtest', 'ucm_cloudtest_db', 'UCM CloudTest DB', 'DB', true, 'ucm_cloudtest', 'UCM Cloud Test'),
  ucm_cloudtest_sim: generateConfigDefault('ucm-vsts-cloudtest', 'ucm_cloudtest_sim', 'UCM CloudTest SIM', 'SIM', true, 'ucm_cloudtest', 'UCM Cloud Test'),
  ucm_cloudtest_ui: generateConfigDefault('ucm-vsts-cloudtest', 'ucm_cloudtest_ui', 'UCM CloudTest UI', 'UI', true, 'ucm_cloudtest', 'UCM Cloud Test'),

  //Campaign MT
  campaign_mt_fftp: generateConfigDefault('campaign-mt-fftp', 'campaign_mt_fftp', 'Campaign MT FFTP', null, true, null, 'Campaign MT'),
  campaign_mt_bvt: generateConfigDefault('campaign-mt-fftp', 'campaign_mt_bvt', 'Campaign MT SI', null, true, null, 'Campaign MT'),

  //Campaign DB
  campaign_db_si: generateConfigDefault('campaign-db-si', 'campaign_db_si', 'Campaign DB SI', null, true, 'campaign_db_si', 'Campaign DB'),
  ad_group_shard_ut: CampaignDbCiGenerator('ad_group_shard_ut', 'AdGroupShard UT', 'AdGroupShard UT'),
  db_mt_bvts_on_azure: CampaignDbCiGenerator('db_mt_bvts_on_azure', 'DB MT BVTs on Azure', 'DB MT BVTs on Azure'),
  load_balancer_bvts: CampaignDbCiGenerator('load_balancer_bvts', 'LoadBalancer BVTs', 'LoadBalancer BVTs'),
  main_shard_unit_test: CampaignDbCiGenerator('main_shard_unit_test', 'MainShard Unit Tests', 'MainShard Unit Tests'),
  vertical_db_unit_test: CampaignDbCiGenerator('vertical_db_unit_test', 'VerticalDB Unit Tests', 'VerticalDB Unit Tests'),

  //Campaign UI
  campaign_ui_ci: generateConfigDefault('campaign-ui-ci', 'campaign_ui_ci', 'Campaign UI CI', null, true, 'campaign_ui_ci', 'Campaign UI'),
  campaign_ui_si: generateConfigDefault('campaign-ui-si', 'campaign_ui_si', 'Campaign UI SI', null, true, 'campaign_ui_si', 'Campaign UI'),

  //CCMT FFTP
  ccmt_main: CCMTRegularFFTPConfigGenerator('ccmt_main', 'CCMT FFTP', 'ClientCenter MT'),
  customerdb_main: CCMTRegularFFTPConfigGenerator('customerdb_main', 'CCMT CustomerDB UT', 'CustomerDB UT'),
  notificationdb_main: CCMTRegularFFTPConfigGenerator('notificationdb_main', 'CCMT NotificationDB UT', 'NotificationDB UT'),
  appsconsolidateddb_main: CCMTRegularFFTPConfigGenerator('appsconsolidateddb_main', 'CCMT AppsConsolidatedDB UT', 'AppsConsolidatedDB UT'),
  appsconsolidateddb_azure_main: CCMTRegularFFTPConfigGenerator('appsconsolidateddb_azure_main', 'CCMT AppsConsolidatedAzureDB UT', 'AppsConsolidatedAzureDB UT'),
  dimensiondb_main: CCMTRegularFFTPConfigGenerator('dimensiondb_main', 'CCMT DimensionDB UT', 'DimensionDB UT'),
  campaigndb_main: CCMTRegularFFTPConfigGenerator('campaigndb_main', 'CCMT Campaign DB', 'Campaign DB'),
  ccapiv9_main: CCMTRegularFFTPConfigGenerator('ccapiv9_main', 'CCMT CCAPI V9', 'Client Center API V9'),
  ccapiv11_main: CCMTRegularFFTPConfigGenerator('ccapiv11_main', 'CCMT CCAPI V11', 'Client Center API V11'),

  //Billing FFTP
  AdvertiserThresholdBillingP1_main: BillingRegularFFTPConfigGenerator('AdvertiserThresholdBillingP1_main', 'Billing AdvertiserThresholdBillingP1', 'AdvertiserThresholdBillingP1'),
  CampaignBudgetP1_main: BillingRegularFFTPConfigGenerator('CampaignBudgetP1_main', 'Billing CampaignBudgetP1', 'CampaignBudgetP1'),
  DasTestsP1_main: BillingRegularFFTPConfigGenerator('DasTestsP1_main', 'Billing DasTestsP1', 'DasTestsP1'),
  ReportTestsP1_main: BillingRegularFFTPConfigGenerator('ReportTestsP1_main', 'Billing ReportTestsP1', 'ReportTestsP1'),
  RevenueFeedTestsP1_main: BillingRegularFFTPConfigGenerator('RevenueFeedTestsP1_main', 'Billing RevenueFeedTestsP1', 'RevenueFeedTestsP1'),
  YahooApisP1_main: BillingRegularFFTPConfigGenerator('YahooApisP1_main', 'Billing YahooApisP1', 'YahooApisP1'),
  Billing_BVT_main: BillingRegularFFTPConfigGenerator('Billing_BVT_main', 'Billing BVT', 'BVT'),
  Billing_vNext_main: BillingRegularFFTPConfigGenerator('Billing_vNext_main', 'Billing vNext', 'vNext'),

  // For Billing SI.
  BillingAPI: BillingSIConfigGenerator('billing-api', 'BillingAPI'),
  BillingMT: BillingSIConfigGenerator('billing-mt', 'BillingMT'),

  // For CCMT SI.
  BVTAPIV11: CCMTSIConfigGenerator('bvt-api-v11', 'BVTAPIV11'),
  BVTAPIV9: CCMTSIConfigGenerator('bvt-api-v9', 'BVTAPIV9'),
  BVTMessageCenter: CCMTSIConfigGenerator('bvt-message-center', 'BVTMessageCenter'),
  BVTCCMT: CCMTSIConfigGenerator('bvt-ccmt', 'BVTCCMT'),
  APIV11: CCMTSIConfigGenerator('api-v11', 'APIV11'),
  APIV9: CCMTSIConfigGenerator('api-v9', 'APIV9'),
  JobProcessor: CCMTSIConfigGenerator('job-processor', 'JobProcessor'),
  CCMT: CCMTSIConfigGenerator('ccmt', 'CCMT'),
  Notification: CCMTSIConfigGenerator('notification', 'Notification'),
  SIOnly: CCMTSIConfigGenerator('si-only', 'SIOnly'),
  EDS: CCMTSIConfigGenerator('eds', 'EDS'),

  // Release
  // ccui-daily-shipping
  CCUI_Prod: ReleaseConfigGenerator('ccui-prod', 'CCUI_Prod', 'CCUI Prod', 'ccui-daily-shipping', 'CCUI Daily Shipping'),
  CCUI_Beta_Prod: ReleaseConfigGenerator('ccui-betaprod', 'CCUI_Beta_Prod', 'CCUI Beta Prod', 'ccui-daily-shipping', 'CCUI Daily Shipping'),
  CCUI_SI_Regression: ReleaseConfigGenerator('ccui-si-regression', 'CCUI_SI_Regression', 'CCUI SI Regression', 'ccui-daily-shipping', 'CCUI Daily Shipping'),
  CCUI_SI_Regression_Azure: ReleaseConfigGenerator('ccui-si-regression-azure', 'CCUI_SI_Regression_Azure', 'CCUI SI Regression Azure', 'ccui-daily-shipping', 'CCUI Daily Shipping'),

  // ccmt-si-azure
  API_V11_1: ReleaseConfigGenerator('apiv11-1', 'API_V11_1', 'API V11', 'ccmt-si-azure', 'CCMT SI AZURE'),
  API_V11_BVT_1: ReleaseConfigGenerator('apiv11bvt-1', 'API_V11_BVT_1', 'API V11 BVT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  API_V9_1: ReleaseConfigGenerator('apiv9-1', 'API_V9_1', 'API V9', 'ccmt-si-azure', 'CCMT SI AZURE'),
  API_V9_BVT_1: ReleaseConfigGenerator('apiv9bvt-1', 'API_V9_BVT_1', 'API V9 BVT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  JobProcessor_1: ReleaseConfigGenerator('jobprocessor-1', 'JobProcessor_1', 'JobProcessor', 'ccmt-si-azure', 'CCMT SI AZURE'),
  MessageCenter_MT_1: ReleaseConfigGenerator('messagecentermt-1', 'MessageCenter_MT_1', 'MessageCenter MT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  MessageCenter_MT_BVT_1: ReleaseConfigGenerator('messagecentermtbvt-1', 'MessageCenter_MT_BVT_1', 'MessageCenter MT BVT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  MT_1: ReleaseConfigGenerator('mt-1', 'MT_1', 'MT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  MT_BVT_1: ReleaseConfigGenerator('mtbvt-1', 'MT_BVT_1', 'MT BVT', 'ccmt-si-azure', 'CCMT SI AZURE'),
  SI_Only_1: ReleaseConfigGenerator('si-only-1', 'SI_Only_1', 'SI Only', 'ccmt-si-azure', 'CCMT SI AZURE'),

  // billing-si-azure
  Billing_Part1_1: ReleaseConfigGenerator('billing-part1-1', 'Billing_Part1_1', 'Billing Part 1', 'billing-si-azure', 'Billing SI Azure'),
  Billing_Part2_1: ReleaseConfigGenerator('billing-part2-1', 'Billing_Part2_1', 'Billing Part 2', 'billing-si-azure', 'Billing SI Azure'),
  Billing_API_1: ReleaseConfigGenerator('billing-api-1', 'Billing_API_1', 'Billing API', 'billing-si-azure', 'Billing SI Azure'),
  Billing_MT_1: ReleaseConfigGenerator('billing-mt-1', 'Billing_MT_1', 'Billing MT', 'billing-si-azure', 'Billing SI Azure'),

  // billing-si-azure-billingazure
  Azure_Billing_Part1_1: ReleaseConfigGenerator('azure-billing-part-1', 'Azure_Billing_Part1_1', 'Azure Billing Part 1', 'billing-si-azure-billingazure', 'Billing SI Azure Partition'),
  Azure_Billing_Part2_1: ReleaseConfigGenerator('azure-billing-part-2', 'Azure_Billing_Part2_1', 'Azure Billing Part 2', 'billing-si-azure-billingazure', 'Billing SI Azure Partition'),
  Azure_Billing_API_1: ReleaseConfigGenerator('azure-billing-api-1', 'Azure_Billing_API_1', 'Azure Billing API', 'billing-si-azure-billingazure', 'Billing SI Azure Partition'),
  Azure_Billing_MT_1: ReleaseConfigGenerator('azure-billing-mt-1', 'Azure_Billing_MT_1', 'Azure Billing MT', 'billing-si-azure-billingazure', 'Billing SI Azure Partition'),
};
