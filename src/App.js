import React, { useState, useEffect, useRef, useMemo, } from 'react';
import {Row, Col} from 'react-simple-flex-grid'
import "react-simple-flex-grid/lib/main.css"
import axios from 'axios';
import { MeetingProvider, useMeeting, useParticipant, MeetingConsumer } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import {genToken, genMeetingId, createMeeting} from './api'

const chunk = (arr)=>{
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 3))
  return newArr;
}

function JoinScreen({updateMeetingId, getMeetingAndToken}) {
  
  return (
    <div style={{width: 'auto', padding: '20px'}}>
      <input type="text" placeholder='Enter Meeting Id' onChange={(e)=>{updateMeetingId(e.target.value)}} style={{height: '40px', width: '300px', padding: '0 15px', fontFamily: 'monospace', fontSize: '1rem'}} />

      <br />
              
      <button style={{height: '45px', color: 'white', backgroundColor: 'cornflowerblue', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={getMeetingAndToken}>Join</button>

      <br />

      <button style={{height: '45px', color: 'white', backgroundColor: 'cornflowerblue', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={getMeetingAndToken}>Create Meeting</button>  

        <br />
    </div>
  )
}

function ParticipantView(props) {
  const webCamRef = useRef(null)
  const micRef = useRef(null)
  const screenShareRef = useRef(null)

  const {displayName, webcamStream, micStream, screenShareStream, webcamOn, micOn, screenShareOn} = useParticipant(props.participantId)

  useEffect(()=>{
    if (webCamRef.current){
      if(webcamOn){
        const mediaStream = new MediaStream()
        mediaStream.addTrack(webcamStream.track);

        webCamRef.current.srcObject = mediaStream;
        webCamRef.current
          .play()
          .catch((error) => console.error("VideoElem.current.play() failed : ", error))
      }else{
        webCamRef.current.srcObject = null;
      }
    }
  },[micStream, micOn])
  
  useEffect(() => {
  if (screenShareRef.current){
    if (screenShareOn){
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);

      screenShareRef.current.srcObject = mediaStream;
      screenShareRef.current
      .play()
      .catch((error)=> console.error("VideoElem.current.play() failed : ", error))
    }else {
      screenShareRef.current.srcObject = null;
    }
  }
}, [screenShareStream, screenShareOn])

  return (
    <div key={props.participantId} style={{padding: '30px 20px'}} >
      <span>Mic: {micOn ? "Yes": "No"}, Camera : {webcamOn? "Yes":"No"}, Screen Share On : {screenShareOn ? "Yes": "No"}</span>
      <audio ref={micRef} autoPlay />
      <br />
      {webCamRef || micOn ? (<div>
        <h2>{displayName}</h2>
        <video height={"300px"} width={"600px"} ref={webCamRef} autoPlay />
      </div>): null  }
      {screenShareOn ? (<div>
        <h2>Screen Shared</h2>
        <video height={"300px"} width={"600px"} ref={screenShareRef} autoPlay ></video>
      </div>): null}
    </div>
  )
}


function MeetingGrid(props) {
  const [joined, setJoined] = useState(false)

  const {join, leave, toggleMic, toggleWebCam, toggleScreenShare} = useMeeting()

  const {participants} = useMeeting()

  const joinMeeting = ()=>{
    setJoined(true);
    join()
  }

  return (
    <div style={{width: 'auto', padding: '20px'}}>
        <header>Meeting Id: <strong>{props.meetingId}</strong></header>

        {joined ?
          (<div style={{display: 'flex', flexDirection: 'row', gap:'20px'}}>
            <button style={{height: '45px', color: 'white', backgroundColor: 'orangered', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={leave} >Leave</button>

            <button style={{height: '45px', color: 'white', backgroundColor: 'cornflowerblue', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={toggleMic}>Toggle Mic</button>

            <button style={{height: '45px', color: 'white', backgroundColor: 'cornflowerblue', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={toggleWebCam}>Toggle Web Cam</button>

            <button style={{height: '45px', color: 'white', backgroundColor: 'brown', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={toggleScreenShare}>Toggle Screen Share</button>

          </div>)
          :
          (<button style={{height: '45px', color: 'white', backgroundColor: 'cornflowerblue', padding: '0 10px', border: 'none', borderRadius: '3px', fontFamily: 'monospace', width: '330px', marginTop: '25px', fontSize: '1.1rem', cursor: 'pointer'}} onClick={joinMeeting}>Join Meeting</button>)
        }
        <div>
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
      </div>
    </div>
  )
}

function App(){
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null)

  const getMeetingAndToken = async()=>{
    const token = await genToken()
    setToken(token)
    setMeetingId(meetingId ? meetingId : (await createMeeting(token)))
  }

  const updateMeetingId = (meetingId)=>{
    setMeetingId(meetingId)
  }


  return token && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true, 
        webcamEnabled: true,
        name: 'Iroegbu David'
      }}
      token={token}
    >
      <MeetingConsumer>
        {()=> <MeetingGrid meetingId={meetingId} getMeetingAndToken={getMeetingAndToken} /> }
      </MeetingConsumer>
    </MeetingProvider>
  ) : ( <JoinScreen updateMeetingId={updateMeetingId} getMeetingAndToken={getMeetingAndToken} /> )
}

export default App;
