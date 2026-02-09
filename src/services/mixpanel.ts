import {Mixpanel} from 'mixpanel-react-native';
import Env from '../constants/Env';

const projectToken = Env.MIXPANEL_PROJECT_TOKEN;
const mixpanel = new Mixpanel(projectToken, false);
mixpanel.init();

export default mixpanel;
