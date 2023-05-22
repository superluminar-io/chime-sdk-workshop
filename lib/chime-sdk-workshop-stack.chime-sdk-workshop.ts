import { randomUUID } from 'crypto';

import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
} from '@aws-sdk/client-chime-sdk-meetings';
const config = {
  region: 'eu-central-1',
};


const chimeSdkMeetingsClient = new ChimeSDKMeetingsClient(config);

var response = {
  statusCode: 200,
  body: '',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '_',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  },
};

export async function createMeeting(requestId: string) {
  console.log('Creating Meeting for Request ID: ', requestId);
  const meetingInfo = await chimeSdkMeetingsClient.send(
    new CreateMeetingCommand({
      ClientRequestToken: requestId,
      MediaRegion: 'eu-central-1',
      ExternalMeetingId: requestId,
    }),
  );
  return meetingInfo;
}

async function createAttendee(meetingId: string) {
  console.log('Creating Attendee for Meeting: ', meetingId);
  const attendeeInfo = await chimeSdkMeetingsClient.send(
    new CreateAttendeeCommand({
      MeetingId: meetingId,
      ExternalUserId: randomUUID(),
    }),
  );
  return attendeeInfo;
}

export async function handler(event: any, _context: any) {
  var requestedMeeting = 'testMeeting';

  if (event.queryStringParameters && event.queryStringParameters.m) {
    requestedMeeting = event.queryStringParameters.m;
  }
  console.log('Requested Meeting', requestedMeeting);

  const meetingInfo = await createMeeting(requestedMeeting);
  if (!meetingInfo) {
    response.statusCode = 503;
    response.body = JSON.stringify('Error creating Meeting');
    return response;
  }

  const attendeeInfo = await createAttendee(meetingInfo.Meeting!.MeetingId!);
  if (!attendeeInfo) {
    response.statusCode = 503;
    response.body = JSON.stringify('Error creating Attendee');
    return response;
  }

  const responseInfo = {
    Meeting: meetingInfo.Meeting,
    Attendee: attendeeInfo.Attendee,
  };
  response.statusCode = 200;
  response.body = JSON.stringify(responseInfo);
  return response;
}
