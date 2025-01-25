// shared-models/User.ts
// shared-models/User.ts
export interface UtilisateurCompte {
  id: string;
  email?: string;
  displayName: string;
  dateDerniereConnexion?: Date;
  datePassword?: Date;
  oldPasswordsArray?: [String];
}
export interface UserPayload {
  email: string;
  // id: string;
  // Ajoutez d'autres champs selon vos besoins
}