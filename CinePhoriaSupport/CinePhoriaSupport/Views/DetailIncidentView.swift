//
//	DetailIncidentView.swift
//	CinePhoriaSupport
//
//  Cree par Bruno DELEBARRE-DEBAY on 03/05/2025.
//  bd2db
//


import SwiftUI
import SwiftData

@MainActor
struct DetailIncidentView: View {
    @Bindable var incident: Incident
    @Binding var selectedIncident: Incident?
    
    let funcSync: (_ for: Incident) async throws -> Bool
    
    @Environment(\.modelContext) var modelContext
    @Environment(\.dismiss) var dismiss

    @State private var showConfirmationAlert = false
    @State private var showDeleteConfirmation = false
    @State private var pendingStatusChange: String?
    @State private var isSynchIncident: Bool = false

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
            Section() {
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
                Task {
                    self.isSynchIncident = try await funcSync(incident)
                }
            } catch {
                print("❌ Erreur lors de la sauvegarde : \(error)")
            }
        }
    }

    private var isResolved: Bool {
        incident.status == "Résolu"
    }
}

//#Preview {
//    DetailIncidentView()
//}
