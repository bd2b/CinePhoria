//
//	UsefulFunc.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 27/11/2024.
//  bd2db
//


import Foundation

func isValidEmail(_ email: String) -> Bool {
    let emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    let emailTest = NSPredicate(format: "SELF MATCHES %@", emailRegex)
    return emailTest.evaluate(with: email)
}
