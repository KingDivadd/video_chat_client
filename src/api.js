import React from 'react'
import axios from 'axios';


const local_server_url = "https://ohealth-telemedicine-backend-vfhrg27ctq-no.a.run.app/api/v1/chat"
export const genToken = async() => {
    try {
        const response = await axios.post(`${local_server_url}/generate-token`, {
            appointment_id: "442aedfe-07a7-45bb-9074-cbbd70909c2b"
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-id-key": "74614e1c-9b1c-4118-af57-676bbba35d03"
            }
        })
        const token = response.data.token
        console.log(token)
        return token
    } catch (err) {
        console.log(err)
    }
}
export const genMeetingId = async(token) => {
    try {
        console.log(1)
        const response = await axios.post(`${local_server_url}/create-meeting`, {
            appointment_id: '442aedfe-07a7-45bb-9074-cbbd70909c2b',
            region: 'af-south-1'
        }, {
            headers: {
                "x-id-key": "74614e1c-9b1c-4118-af57-676bbba35d03",
                "authorization": token,
                "Content-Type": "application/json"
            }
        });
        console.log('create meeting response : ', response.data)
        console.log(1)

        const meetingId = response.data.roomId;
        return meetingId;

    } catch (err) {
        console.log(3)
        console.error(err)
    }
}

export async function createMeeting(token) {
    try {
        let new_token = token
        if (!token) {
            const tokn = await genToken()
            console.log('Token generated ', tokn)
            new_token = tokn
        }

        const meetingId = await genMeetingId(new_token)
        console.log('Meeting Id ', meetingId)
        return (meetingId)
    } catch (err) {
        console.err(err)
    }
}