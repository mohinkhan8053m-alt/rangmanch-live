import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // यह आपकी API Keys को सुरक्षित तरीके से पढ़ रहा है
  const apiKey = process.env.LIVEKIT_API_KEY; 
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  // यूजर और रूम का नाम प्राप्त करना
  const { room, username } = req.query;

  if (!room || !username) {
    return res.status(400).json({ error: 'Room and username are required' });
  }

  // LiveKit टोकन जनरेट करना
  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  at.addGrant({ roomJoin: true, room: room });

  const token = await at.toJwt();
  
  // रिस्पॉन्स में टोकन भेजना
  res.status(200).json({ token });
}
