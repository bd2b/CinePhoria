//
//	CinePhoriaSupportApp.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import SwiftUI
import SwiftData

@main
struct CinePhoriaSupportApp: App {
    @StateObject private var dataController = DataController()
    var body: some Scene {
        WindowGroup {
            ContentView(dataController: dataController) // plus de dataController ici
        }
        .environment(\.modelContext, dataController.modelContext)
        .environmentObject(dataController)
    }
}
