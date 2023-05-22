import {
  GlobalStyles, lightTheme, MeetingProvider,
} from 'amazon-chime-sdk-component-library-react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import MyApp from './App';

const Root = () => (
  <ThemeProvider theme={lightTheme}>
    <GlobalStyles />
    <MeetingProvider>
      <MyApp />
    </MeetingProvider>
  </ThemeProvider>
);

window.addEventListener('load', () => {
  ReactDOM.render(Root(), document.getElementById('root'));
});
