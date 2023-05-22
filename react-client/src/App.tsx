// import React from "react";
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import '@cloudscape-design/global-styles/index.css';
import { AudioInputControl, AudioOutputControl, ControlBar, ControlBarButton, DeviceLabels, Phone, useMeetingManager, VideoInputControl, VideoTileGrid } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { render } from 'react-dom'; // <- This is the correct import // statement for React version 17

var url = window.location.href.split('apps')[0];
var apiUrl = url + 'meetingInfo'; // assumes meetingInfo is using the same API GW

console.log(apiUrl);

const MyApp = () => {
  const meetingManager = useMeetingManager();
  const queryString = window.location.search;
  console.log('QueryString:', queryString);
  const urlParams = new URLSearchParams(queryString);
  var user = urlParams.get('user');
  console.log('User...', user);

  async function getMeetingInfo(meetingId: string) {
    console.log('apiUrl is', apiUrl);
    const meetingInfoUrl = apiUrl + '?m=' + meetingId;
    console.log('Fetching', meetingInfoUrl);
    const response = await fetch(meetingInfoUrl);
    return response.json();
  }

  const joinMeeting = async () => {
    // Fetch the meeting and attendee data
    const data = await getMeetingInfo('testMeeting');
    console.log('data:', data);
    const meetingId = data.Meeting.MeetingId;
    const attendeeId = data.Attendee.AttendeeId;
    const externalMeetingId = data.Meeting.ExternalMeetingId;

    render(
      <p>Meeting ID: {meetingId}</p>,
      document.getElementById('meetingId'),
    );
    render(
      <p>Attendee ID: {attendeeId}</p>,
      document.getElementById('attendeeId'),
    );
    render(
      <p>External Meeting ID: {externalMeetingId}</p>,
      document.getElementById('externalMeetingId'),
    );

    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      data.Meeting,
      data.Attendee,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const options = {
      deviceLabels: DeviceLabels.AudioAndVideo,
    };

    // Use the join API to create a meeting session
    await meetingManager.join(meetingSessionConfiguration);
    console.log(
      'Created meeting session:',
      data.Meeting,
      'for:  ',
      data.Attendee,
    );

  };

  const leaveMeeting = async () => {
    await meetingManager.leave();
  };

  const MeetingView = () => (
    <div>
      <Container
        fitHeight
        header={
          <Header
            variant="h2"
            description="This is the second workshop App.js build"
          >
          Amazon Chime SDK React app
          </Header>
        }
      >
        <div>
          <Button id="join" onClick={joinMeeting}>
            Join Meeting
          </Button>
          <SpaceBetween size="s">
            <div id="externalMeetingId"></div>
            <div id="attendeeId"></div>
            <div id="meetingId"></div>
          </SpaceBetween>
        </div>

      </Container>
      <Container>
        <div
          id="videoWindow"
          style={{
            marginTop: '0rem',
            height: '45rem',
            width: '60rem',
            display: 'flex',
            top: '50%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <ControlBar layout="undocked-vertical" showLabels>
              <AudioInputControl />
              <AudioOutputControl />
              <VideoInputControl />
              <ControlBarButton
                icon={<Phone />}
                onClick={leaveMeeting}
                label="End"
              />
            </ControlBar>
          </div>
          <div id="video">
            <div
              className="gridVideo"
              style={{
                marginTop: '0rem',
                height: '40rem',
                width: '53rem',
                display: 'flex',
                top: '50%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'solid 1px black',
              }}
            >
              <VideoTileGrid
                layout="standard"
                noRemoteVideoView="   ::: No remote video yet (send this URL to a friend, or open it in an another browser window to add a remote participant) :::"
                css="border: solid 5px red"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );

  return MeetingView();
};
export default MyApp;
