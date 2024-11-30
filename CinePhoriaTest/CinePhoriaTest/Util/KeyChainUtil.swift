//
//	KeyChainUtil.swift
//	CinePhoriaTest
//
//  Cree par Bruno DELEBARRE-DEBAY on 26/11/2024.
//  bd2db
//


import Foundation

enum KeychainError: Error {
    case conversionError
    case osStatusError(OSStatus)
}

public func setValue(_ value: String, for user: String, and service: String) throws {
    guard let encodedPassword = value.data(using: .utf8) else {
        throw KeychainError.conversionError
    }
  
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
    query[String(kSecAttrAccount)] = user
  
    var status = SecItemCopyMatching(query as CFDictionary, nil)
    switch status {
    case errSecSuccess:
        var attributesToUpdate: [String: Any] = [:]
        attributesToUpdate[String(kSecValueData)] = encodedPassword
        
        status = SecItemUpdate(query as CFDictionary,
                               attributesToUpdate as CFDictionary)
        if status != errSecSuccess {
            throw KeychainError.osStatusError(status)
        }
    case errSecItemNotFound:
        query[String(kSecValueData)] = encodedPassword
        
        status = SecItemAdd(query as CFDictionary, nil)
        if status != errSecSuccess {
            throw KeychainError.osStatusError(status)
        }
    default:
        throw KeychainError.osStatusError(status)
    }
}


func deleteValue(for user: String, and service: String) throws {
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
    query[String(kSecAttrAccount)] = user
    
    let status = SecItemDelete(query as CFDictionary)
}

public func getValue(for user: String, and service: String) throws -> String? {
    var query: [String: Any] = [:]
    query[String(kSecClass)] = kSecClassGenericPassword
    query[String(kSecAttrService)] = service
    query[String(kSecAttrAccount)] = user
    query[String(kSecMatchLimit)] = kSecMatchLimitOne
    query[String(kSecReturnAttributes)] = kCFBooleanTrue
    query[String(kSecReturnData)] = kCFBooleanTrue

    var queryResult: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &queryResult)

    switch status {
    case errSecSuccess:
        guard let queriedItem = queryResult as? [String: Any],
              let passwordData = queriedItem[String(kSecValueData)] as? Data,
              let password = String(data: passwordData, encoding: .utf8) else {
            throw KeychainError.conversionError
        }
        return password
    case errSecItemNotFound:
        return nil
    default:
        throw KeychainError.osStatusError(status)
    }
}
