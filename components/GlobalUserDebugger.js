import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from './UserContext';

export default function GlobalUserDebugger() {
  const { 
    user, 
    firebaseUser, 
    globalUserRole, 
    loading,
    loadPersistedRole 
  } = useAuth();

  const handleRefreshRole = async () => {
    await loadPersistedRole();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>🔄 Cargando estado global...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 DEBUG - Estado Global del Usuario</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Estado de la App:</Text>
        <Text style={styles.info}>• Loading: {loading ? '🔄 Sí' : '✅ No'}</Text>
        <Text style={styles.info}>• Rol Global: {globalUserRole ? `🎯 ${globalUserRole.toUpperCase()}` : '❌ No definido'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Usuario Firebase:</Text>
        <Text style={styles.info}>• Estado: {firebaseUser ? '✅ Autenticado' : '❌ No autenticado'}</Text>
        {firebaseUser && (
          <>
            <Text style={styles.info}>• Email: {firebaseUser.email}</Text>
            <Text style={styles.info}>• UID: {firebaseUser.uid}</Text>
            <Text style={styles.info}>• Verificado: {firebaseUser.emailVerified ? '✅ Sí' : '❌ No'}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎭 Usuario App:</Text>
        <Text style={styles.info}>• Estado: {user ? '✅ Definido' : '❌ No definido'}</Text>
        {user && (
          <>
            <Text style={styles.info}>• Email: {user.email}</Text>
            <Text style={styles.info}>• UID: {user.uid}</Text>
            <Text style={styles.info}>• Rol: {user.role}</Text>
            <Text style={styles.info}>• Verificado: {user.emailVerified ? '✅ Sí' : '❌ No'}</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshRole}>
        <Text style={styles.refreshButtonText}>🔄 Recargar Rol Persistido</Text>
      </TouchableOpacity>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>📊 Resumen del Estado:</Text>
        <Text style={styles.summaryText}>
          {globalUserRole && user && user.emailVerified 
            ? '✅ Usuario completamente configurado y listo para usar'
            : globalUserRole && user && !user.emailVerified
            ? '⚠️ Rol seleccionado pero email no verificado'
            : globalUserRole && !user
            ? '⚠️ Rol seleccionado pero usuario no autenticado'
            : '❌ No hay rol seleccionado ni usuario autenticado'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#495057',
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#6c757d',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2',
  },
  summaryText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
