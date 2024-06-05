import React from 'react'
import axios from 'axios';


const local_server_url = "https://ohealth-telemedicine-dev-ab664a0cebb8.herokuapp.com/api/v1/chat"
export const genToken = async() => {
    try {
        const response = await axios.post(`${local_server_url}/generate-token`, {
            appointment_id: "442aedfe-07a7-45bb-9074-cbbd70909c2b"
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-id-key": "8e2c1fdc-e143-4eef-90fe-29c76c92ff14"
            }
        })
        const token = response.data.token
        console.log(token)
        return token
    } catch (err) {
        console.error(err)
    }
}
export const genMeetingId = async(token) => {
    try {
        const response = await axios.post(`${local_server_url}/create-meeting`, {
            token,
            region: 'af-south-1'
        }, {
            headers: {
                "x-id-key": "8e2c1fdc-e143-4eef-90fe-29c76c92ff14",
                "Content-Type": "application/json"
            }
        });
        console.log('create meeting response : ', response.data)

        const meetingId = response.data.meetingId;
        return meetingId;

    } catch (err) {
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