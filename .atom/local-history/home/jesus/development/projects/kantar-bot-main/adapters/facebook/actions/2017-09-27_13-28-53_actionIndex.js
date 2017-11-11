const getStarted = require('./branded/getStarted');
const catalogue = require('./branded/catalogue');
const reserve = require('./branded/reserve');
const survey = require('./branded/survey');
const hotelInfo = require('./branded/hotelInfo');
const hotelServices = require('./branded/hotelServices');
const loginGuest = require('./branded/loginGuest');
const lead = require('./branded/lead');
const loginReferral = require('./branded/loginReferral');
const hotelRequests = require('./branded/hotelRequests');
const hotelDestination = require('./branded/hotelDestination');
const showProducts = require('./branded/showProducts');
const orderProduct = require('./branded/orderProduct');
const infoService = require('./branded/infoService');
const showIssue = require('./branded/showIssue');
const showFAQ = require('./branded/showFAQ');
const showWhen = require('./branded/showWhen');
const showPredefinedProduct = require('./branded/showPredefinedProduct');
const showActivity = require('./branded/showActivity');
const thankYou = require('./branded/thankYou');
const hotelBooking = require('./branded/hotelBooking');
const kids = require('./branded/kids');
const smoke = require('./branded/smoke');
const handicaped = require('./branded/handicaped');
const doctor = require('./branded/doctor');
const lugagge = require('./branded/lugagge');
const pets = require('./branded/pets');
const goodbye = require('./branded/goodbye');
const roomBooking = require('./branded/roomBooking');
const startSurvey = require('./branded/startSurvey');
const startSurveyFeed = require('./branded/startSurveyFeed');
const checkin = require('./branded/checkin');
const externalServices = require('./branded/externalServices');
const eatingServices = require('./branded/eatingServices');
const eat = require('./branded/eat');
const mySchedule = require('./branded/mySchedule');
const logout = require('./branded/logout');
const parseDateTimeAndBook = require('./branded/parseDateTimeAndBook');
const hotelCongresses = require('./branded/hotelCongresses');
const hotelCongress = require('./branded/hotelCongress');
const searchCongress = require('./branded/searchCongress');
const weather = require('./branded/weather');
const stayBotMenu = require('./branded/stayBotMenu');
const selectHotel = require('./branded/selectHotel');
const selectHotelByLocation = require('./branded/selectHotelByLocation');
const hotelSelected = require('./branded/hotelSelected');
const acceptOnDemandProposal = require('./branded/acceptOnDemandProposal');
const secondaryEntity = require('./branded/secondaryEntity');

module.exports = {
  'branded': {
    'GET_STARTED': startSurvey,
    'GET_STARTED_HAVE_BOOKING': getStarted,
    'GET_STARTED_JUST_NOSING': getStarted,
    'GET_STARTED_LOGIN': getStarted,
    'CATALOGUE': catalogue,
    'RESERVE': reserve,
    'SURVEY': survey,
    'HOTEL_INFO': hotelInfo,
    'HOTEL_SERVICES': hotelServices,
    'LOGIN_GUEST': loginGuest,
    'LOGIN_PMS_AUTHENTICATE': loginGuest,
    'LEAD': lead,
    'LOGIN_REFERRAL': loginReferral,
    'HOTEL_REQUESTS': hotelRequests,
    'HOTEL_DESTINATION': hotelDestination,
    'PRODUCTS': showProducts,
    'ORDER': orderProduct,
    'INFO_SERVICE': infoService,
    'ISSUE': showIssue,
    'FAQ': showFAQ,
    'WHEN': showWhen,
    'SHOW_PREDEFINED_PRODUCT': showPredefinedProduct,
    'ACTIVITY': showActivity,
    'THANK_YOU': thankYou,
    'HOTEL_BOOKING': hotelBooking,
    'HOTEL_PERFORM_FAKE_BOOKING': hotelBooking,
    'DESTINATION': hotelDestination,
    'KIDS': kids,
    'SMOKE': smoke,
    'HANDICAPED': handicaped,
    'DOCTOR': doctor,
    'LUGAGGE': lugagge,
    'PETS': pets,
    'GOODBYE': goodbye,
    'ROOM_BOOKING': roomBooking,
    'CHECK_IN': checkin,
    'EXTERNAL_SERVICES': externalServices,
    'EATING_SERVICES': eatingServices,
    'EAT': eat,
    'MY_SCHEDULE': mySchedule,
    'LOG_OUT': logout,
    'PARSE_DATETIME_BOOKING': parseDateTimeAndBook,
    'CONGRESSES': hotelCongresses,
    'CONGRESS': hotelCongress,
    'CONGRESS_SEARCH': searchCongress,
    'WEATHER': weather,
    'STAY_BOT_MENU': stayBotMenu,
    'STAY_SELECT_HOTEL': selectHotel,
    'STAY_LOCATION_HOTEL': selectHotelByLocation,
    'CHOSEN_HOTEL': hotelSelected,
    'ONDEMAND_PROPOSAL': acceptOnDemandProposal,
    'START_SURVEY': startSurvey,
    'START_SURVEY_FEED': startSurveyFeed,
    'SECONDARY_ENTITY': secondaryEntity
  }
};