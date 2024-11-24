//
//	DateFormatter.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 24/11/2024.
//  bd2db
//



import Foundation

struct DateFormatterHelper {
    static let shared = DateFormatterHelper()
    private let formatter = DateFormatter()

    /// Extraction de l'heure en string sous format HH:MM
    func hourString(from date: Date) -> String {
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }

    /// Extraction du mois en 3 ou 4 lettres
    func monthString(from date: Date) -> String {
        let months = [
            "JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUIL",
            "AOU", "SEP", "OCT", "NOV", "DEC"
        ]
        let calendar = Calendar.current
        let monthIndex = calendar.component(.month, from: date) - 1
        return months[monthIndex]
    }

    /// Extraction du jour de la semaine (lun, mar, ...)
    func weekdayString(from date: Date) -> String {
        let weekdays = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"]
        let calendar = Calendar.current
        let weekdayIndex = calendar.component(.weekday, from: date) - 1
        return weekdays[weekdayIndex]
    }

    /// Extraction du numéro de jour dans le mois sur 1 ou 2 digits
    func dayOfMonth(from date: Date) -> String {
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }
}
