//
//	DataController+PersistenceReservations.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 29/11/2024.
//  bd2db
//


import Foundation
import SwiftUI

let nameFileReservations: String = "PersistenceReservations.json"

/// Pour répondre au besoin de stocker les réservations en local afin d'avoir le QRCode même si on est déconnecté du réseau,
/// on stocke les reservation dans un fichier local en JSON
///
extension DataController {

    /// Sauvegarde des réservations localement au format JSON
    func saveReservationsToLocal() {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        do {
            let jsonData = try encoder.encode(self.reservations)
            if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
                let fileURL = documentDirectory.appendingPathComponent(nameFileReservations)
                
                // Supprimer le fichier existant si nécessaire
                if FileManager.default.fileExists(atPath: fileURL.path) {
                    try FileManager.default.removeItem(at: fileURL)
                }
                
                // Écrire les nouvelles données
                try jsonData.write(to: fileURL)
                print("Réservations sauvegardées localement : \(fileURL)")
            }
        } catch {
            print("Erreur lors de la sauvegarde des réservations : \(error)")
        }
    }
    
    
    /// Charge les réservations depuis le fichier local JSON
    func loadReservationsFromLocal() {
        if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let fileURL = documentDirectory.appendingPathComponent(nameFileReservations)
            do {
                let jsonData = try Data(contentsOf: fileURL)
                let decoder = JSONDecoder()
                reservations = try decoder.decode([Reservation].self, from: jsonData)
                print("Réservations chargées depuis le fichier local.")
            } catch {
                print("Erreur lors du chargement des réservations locales : \(error)")
            }
        }
    }
    
    /// Supprime la copie locale
    func deleteReservationsToLocal() {
        if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let fileURL = documentDirectory.appendingPathComponent(nameFileReservations)
            
            // Supprimer le fichier existant si nécessaire
            if FileManager.default.fileExists(atPath: fileURL.path) {
                do {
                    try FileManager.default.removeItem(at: fileURL)
                } catch {
                    print("Erreur lors de la suppression du fichier local : \(error)")
                }
            }
        }
    }
    // Sauvegarde UIImage
    func saveUIImage(_ image: UIImage, named filename: String) throws {
        if let data = image.pngData(),
           let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let url = dir.appendingPathComponent(filename)
            try data.write(to: url)
        }
    }
    
    // Restore UIImage
    func loadUIImage(named filename: String) -> UIImage? {
        if let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let url = dir.appendingPathComponent(filename)
            return UIImage(contentsOfFile: url.path)
        }
        return nil
    }
    
}

func saveImageFrom2(url: URL, named filename: String) async {
    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data),
              let pngData = image.pngData(),
              let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
        else { return }

        let path = documents.appendingPathComponent(filename)
        try pngData.write(to: path)
        print("✅ Image sauvegardée à \(path)")
    } catch {
        print("❌ Erreur sauvegarde image : \(error)")
    }
}

func saveImageFrom(url: URL, named filename: String) async {
    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data),
              let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            print("❌ Erreur de lecture ou décodage UIImage")
            return
        }

        let ext = (filename as NSString).pathExtension.lowercased()
        let outputURL = documents.appendingPathComponent(filename)

        let imageData: Data?
        if ext == "jpg" || ext == "jpeg" {
            imageData = image.jpegData(compressionQuality: 0.85)
        } else {
            imageData = image.pngData()
        }

        if let imageData = imageData {
            try imageData.write(to: outputURL)
            print("✅ Image sauvegardée : \(outputURL)")

            // 💡 ajouter dans le cache
        //    ImageCache.shared.setObject(image, forKey: filename as NSString)
        } else {
            print("❌ Impossible de générer imageData")
        }
    } catch {
        print("❌ Erreur lors de la sauvegarde de l'image : \(error)")
    }
}
