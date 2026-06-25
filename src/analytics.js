import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-DQVRR7SC00";
let initialized = false;

export const initializeAnalytics = () => {
  if (initialized) return;
  ReactGA.initialize(MEASUREMENT_ID);
  initialized = true;
};

const isConsented = () => {
  return initialized && localStorage.getItem("cookie-consent") === "accepted";
};

export const pageView = (path) => {
  if (!isConsented()) return;
  const page = path || window.location.pathname + window.location.search;
  ReactGA.send({ hitType: "pageview", page });
};

export const event = (action, params = {}) => {
  if (!isConsented()) return;
  ReactGA.event(action, params);
};
