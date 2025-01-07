// shared-models/User.ts
export interface User {
    username: string;
    id: string;
    email?: string;
  }
export interface UserPayload {
  email: string;
  // id: string;
  // Ajoutez d'autres champs selon vos besoins
}