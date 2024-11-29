//
//	ReservationJSON.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 29/11/2024.
//  bd2db
//

import Foundation

func generateJSON(from reservations: [Reservation], to fileName: String) {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .prettyPrinted // Optionnel : pour rendre le JSON plus lisible

    do {
        let jsonData = try encoder.encode(reservations)

        // Chemin du fichier où enregistrer le JSON
        if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let fileURL = documentDirectory.appendingPathComponent(fileName)

            // Écriture des données JSON dans le fichier
            try jsonData.write(to: fileURL)

            print("Fichier JSON créé avec succès : \(fileURL)")
        }
    } catch {
        print("Erreur lors de l'encodage ou de l'écriture : \(error)")
    }
}


