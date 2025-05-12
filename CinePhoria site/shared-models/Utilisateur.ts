// shared-models/User.ts
// shared-models/User.ts

export class ComptePersonne {
  email!: string;
  dateDerniereConnexion?: Date;
  isValidated?: number;
  utilisateurid?: string;
  utilisateurDisplayName?: string;
  matricule?: number;
  isAdministrateur?: number;
  lastnameEmploye?: string;
  firstnameEmploye?: string;
  listCinemas?: string;
  numConnexions?: number;
  constructor(data: Partial<ComptePersonne>) {
    Object.assign(this, data);
  }
}

export enum TypeCompte {
  None = "none",
  Employe = "employe",
  Utilisateur = "utilisateur"
}

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

