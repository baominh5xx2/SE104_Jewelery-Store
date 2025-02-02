export const API_URL = 'http://localhost:3000/api';
export const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJ1c2VybmFtZSI6InBodW9uZyIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3MzQ4NDAxMDIsImV4cCI6MTczNDkyNjUwMn0.R4cBlSFFaUNTUsoYRBhUcYYPPwZ3MlQncsKzFS1jDRo";

export const getHeaders = () => ({
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
});
