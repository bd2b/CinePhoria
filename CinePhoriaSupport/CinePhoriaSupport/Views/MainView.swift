//
//	MainView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 01/05/2025.
//  bd2db
//


import Foundation
import SwiftUI
import SwiftData

@MainActor
struct MainView: View {
    @Environment(\.modelContext) var modelContext
    @Bindable var dataController: DataController
    
    @State var selectedSalle: Salle?
    @State var selectedIncident: Incident?
    
    @State var listIncidents: [Incident]?
    
    var body: some View {
        NavigationSplitView {
            ListingSallesView(selectedSalle: $selectedSalle
                               , listCinemasNames: dataController.utilisateurDTO?.listCinemas
            )
                .frame(minWidth: 250)
        } content: {
            if let selectedSalle ,
               let listIncidents = selectedSalle.incidents {
                List(listIncidents) { incident in
                    Button {
                        selectedIncident = incident
                    } label: {
                        HStack{
                            VStack(alignment: .leading) {
                                Text(incident.title ).bold()
                                Text(incident.status )
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            if selectedIncident?.id == incident.id {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.accent)
                            }
                        }
                        .padding(6)
                        .background(
                            selectedIncident?.id == incident.id
                            ? Color.accentColor.opacity(0.1)
                            : Color.clear
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                    .buttonStyle(.plain)
                }
                .navigationTitle("Incidents")
                .toolbar {
                    Button("Créer un incident", systemImage: "plus") {
                        selectedIncident = addIncident(for: selectedSalle)
                    }
                }
            } else {
                Text("Sélectionnez une salle pour voir les incidents correspondants.")
            }
            
        } detail: {
            if let selectedIncident = selectedIncident {
                DetailIncidentView(incident: selectedIncident , selectedIncident: $selectedIncident , funcSync: dataController.syncIncidentToServer(_:))
            } else {
                Text("Selectionner un incident pour voir les détails.")
            }
        }
        .onChange(of: selectedSalle) {
            DispatchQueue.main.async {
                selectedIncident = nil
            }
        }
        
    }
    
    func addIncident(for salle: Salle) -> Incident? {
        // 1. Récupère tous les incidents pour trouver le plus grand ID
        let incidents = (try? modelContext.fetch(FetchDescriptor<Incident>())) ?? []
        let maxId = incidents.map(\.id).max() ?? 0
        guard let matricule = dataController.utilisateurDTO?.matricule else { return nil }
        guard let employe = dataController.employeCourant else { return  nil}
        
        
        // 2. Crée un nouvel incident avec l'id + 1
        let incident = Incident(
            id: maxId + 1,
            salleId: salle.id,
            matricule: String(matricule),
            status: "Nouveau",
            title: "A compléter",
            descriptionIncident: "",
            dateOpen: .now
        )
        
        // 3. Établit les relations
        incident.salle = salle
        incident.employe = employe
        
        // 4. Insère dans SwiftData
        modelContext.insert(incident)
        
        return incident
    }
}



