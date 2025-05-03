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


struct ListingSallesView: View {
    
    @Binding var selectedSalle: Salle?
    
    
    @Environment(\.modelContext) var modelContext
    
    @Query var allCinemas: [Cinema]
    @State private var filteredCinemaNames: Set<String> = []
    
    @Query(sort: [ SortDescriptor (\Salle.cinema?.nameCinema), SortDescriptor (\Salle.nameSalle)]) var allSalles: [Salle]
    var sallesFiltrées: [Salle] {
        allSalles.filter { salle in
            let matchCinema = salle.cinema != nil && filteredCinemaNames.contains(salle.cinema!.nameCinema)
            //   let hasIncidents = !(salle.incidents?.isEmpty ?? true)
            return matchCinema // && hasIncidents
        }
    }
    
    
    func libelleSalle (salle: Salle) -> String {
        if let cinema = salle.cinema {
            let nombreIncidents = salle.incidents?.count ?? 0
            let nombreIncidentsStr = nombreIncidents > 0 ? "(\(nombreIncidents))" : ""
            return "\(cinema.nameCinema) - \(salle.nameSalle) \(nombreIncidentsStr)"
        }
        return "\(salle.nameSalle)"
    }
    
    
    var body: some View {
        
        List(sallesFiltrées) { salle in
            Button {
                selectedSalle = salle
                print("📌 Salle sélectionnée : \(salle.nameSalle)")
            } label: {
                HStack {
                    VStack(alignment: .leading) {
                        Text(libelleSalle(salle: salle) )
                            .font(.headline)
                        Text("\(String(salle.capacity)) places")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Text(" ")
                }
                .padding()
            }
            .buttonStyle(.plain)
            .background(
                selectedSalle?.id == salle.id ? Color.accentColor.opacity(0.1) : Color.clear
            )
            .padding(5)
            .clipShape(RoundedRectangle(cornerRadius: 6))
            
        }
        .navigationTitle("Salles avec incidents")
        
        //            .onAppear(){
        //                for salle in allSalles {
        //                    print("🔍 Salle \(salle.nameSalle), incidents : \(salle.incidents?.count ?? 0)")
        //                }
        //            }
        .toolbar {
            Menu {
                ForEach(allCinemas) { cinema in
                    let name = cinema.nameCinema
                    let isSelected = filteredCinemaNames.contains(name)
                    
                    Button {
                        if isSelected {
                            filteredCinemaNames.remove(name)
                        } else {
                            filteredCinemaNames.insert(name)
                        }
                    } label: {
                        HStack {
                            Text(name)
                            Spacer()
                            if isSelected {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
                
                Divider()
                
                Button("Tout sélectionner") {
                    filteredCinemaNames = Set(allCinemas.map { $0.nameCinema })
                }
                
                Button("Tout désélectionner") {
                    filteredCinemaNames = []
                }
            } label: {
                Label("Filtrer par cinéma", systemImage: "line.3.horizontal.decrease.circle")
            }
            
        }
        //        onChange(of: filteredCinemaNames) {
        //
        //        }
        .onAppear {
            if filteredCinemaNames.isEmpty {
                filteredCinemaNames = Set(allCinemas.map { $0.nameCinema })
            }
        }
    }
    
}

struct DetailIncidentView: View {
    @Bindable var incident: Incident
    @Binding var selectedIncident: Incident?
    @Environment(\.modelContext) var modelContext
    @Environment(\.dismiss) var dismiss

    @State private var showConfirmationAlert = false
    @State private var showDeleteConfirmation = false
    @State private var pendingStatusChange: String?

    // Règles de transition de statut
    private var allowedNextStatus: [String] {
        switch incident.status {
        case "Nouveau":
            return ["En cours", "En attente", "Résolu"]
        case "En cours":
            return ["En attente", "Résolu"]
        case "En attente":
            return ["En cours", "Résolu"]
        default:
            return []
        }
    }

    var body: some View {
        Form {
            Section(header: Text("Titre")) {
                TextField("Titre", text: $incident.title)
                    .font(.title3)
                    .disabled(isResolved)
            }

            Section(header: Text("Statut")) {
                Picker("Statut", selection: Binding<String>(
                    get: { incident.status },
                    set: { newValue in
                        if newValue == "Résolu" {
                            // Demander confirmation avant de clore
                            pendingStatusChange = newValue
                            showConfirmationAlert = true
                        } else {
                            incident.status = newValue
                        }
                    }
                )) {
                    ForEach(
                        Array(Set(allowedNextStatus + [incident.status])),
                        id: \.self
                    ) { status in
                        Text(status)
                    }
                }
                .pickerStyle(.menu)
                .labelsHidden()
                .disabled(isResolved)
            }

            Section(header: Text("Description")) {
                TextEditor(text: $incident.descriptionIncident)
                    .frame(minHeight: 120)
                    .overlay(
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(Color.gray.opacity(0.4))
                    )
                    .disabled(isResolved)
            }

            if let date = incident.dateClose {
                Section {
                    Text("Clôturé le : \(date.formatted(date: .abbreviated, time: .shortened))")
                        .foregroundStyle(.secondary)
                }
            }
            if incident.status == "Nouveau" {
                Section {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Annuler la création", systemImage: "trash")
                    }
                }
            }
        }
        .navigationTitle("Détail de l'incident")
        
        .padding()
        .alert("Vous allez clore l'incident, cette opération est irréversible.", isPresented: $showConfirmationAlert) {
            Button("Annuler", role: .cancel) { pendingStatusChange = nil }
            Button("Confirmer", role: .destructive) {
                incident.status = "Résolu"
                incident.dateClose = .now
            }
        }
        .alert("Voulez-vous vraiment annuler cet incident ?", isPresented: $showDeleteConfirmation) {
            Button("Non", role: .cancel) {}
            Button("Oui", role: .destructive) {
                modelContext.delete(incident)
                try? modelContext.save()
                selectedIncident = nil
            }
        }
        .onDisappear {
            do {
                try modelContext.save()
            } catch {
                print("❌ Erreur lors de la sauvegarde : \(error)")
            }
        }
    }

    private var isResolved: Bool {
        incident.status == "Résolu"
    }
}


struct MainView: View {
    @Environment(\.modelContext) var modelContext
    @Bindable var dataController: DataController
    
    @State var selectedSalle: Salle?
    @State var selectedIncident: Incident?
    
    @State var listIncidents: [Incident]?
    
    var body: some View {
        NavigationSplitView {
            ListingSallesView(selectedSalle: $selectedSalle )
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
                DetailIncidentView(incident: selectedIncident , selectedIncident: $selectedIncident)
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



