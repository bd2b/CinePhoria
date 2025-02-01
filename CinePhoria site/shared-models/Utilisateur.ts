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

export class ComptePersonne {
  email!: string;
  dateDerniereConnexion?: Date;
  isValidated?: number;
  utilisateurid?: string;
  utilisateurDisplayName?: string;
  matriculeutilisateurid?: string;
  isAdministrateur?: string;
  lastnameEmploye?: string;
  firstnameEmploye?: string;
  nameCinema?: string;
}