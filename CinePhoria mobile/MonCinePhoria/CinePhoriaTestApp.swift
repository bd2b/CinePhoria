//
//	MonCinePhoriaApp.swift
//	MonCinePhoria
//
//  Cree par Bruno DELEBARRE-DEBAY on 23/11/2024.
//  bd2db
//


import SwiftUI

@main
struct MonCinePhoriaApp: App {
    @State private var dataController = DataController()
    var body: some Scene {
        WindowGroup {
            ContentView(dataController: dataController) // Affiche la vue principale si connecté
                .environment(dataController)
        }
    }
    
}

