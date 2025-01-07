import { Request, Response } from 'express';

// Exemple d'employés
const employees = [
    { email: 'toto@mail.fr', password: 'password' },
];


export class SessionController {

    static login(req: Request, res: Response): void {
        const { email, password } = req.body;

        const employee = employees.find((e) => e.email === email && e.password === password);

        if (!employee) {
            res.status(401).json({ message: 'Identifiants invalides' });
            return;
        }
        // Stocke les informations utilisateur dans la session
        (req.session as any).user = {
            email: employee.email,
        };

        // Stocke l'utilisateur dans la session
        res.json({ message: 'Connexion réussie' });
    };

    static logout(req: Request, res: Response): void {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
            }
            res.json({ message: 'Déconnexion réussie' });
        });
    }
}
