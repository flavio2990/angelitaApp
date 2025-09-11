import React from 'react';
import { 
  Modal as PaperModal, 
  Portal, 
  Text, 
  Button, 
  Card 
} from 'react-native-paper';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  ScrollView, 
  KeyboardAvoidingView 
} from 'react-native';

import TopBarHeader from '@/components/TopBarHeader';
import HamburgerMenu from './HamburgerMenu';

const { width, height } = Dimensions.get('window');

const CustomModal = ({
  visible,
  onDismiss,
  title = "Colocar el titulo aqui",
  content = null,
  actions = [],
  showTopbar = false,
  onBack,
  topbarTitle,
  children,
  isDetailModal = false,
  onModifyPress,
  onGoToPlanPress,
  isEditModal = false,
  onSavePress,
  centerTopbarTitle = false,
  cardMarginTop = 0,
  centerCard = false,
  showHamburgerMenu = true, 
  canEdit = false,
}) => {
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.fullscreenContainer,
          centerCard && { justifyContent: 'center', alignItems: 'center' }
        ]}
      >
        {showTopbar && !centerCard && (
          <TopBarHeader
            showTopBar={true}
            topBarTitle={topbarTitle}
            onBack={onBack}
            centerTitle={centerTopbarTitle}
          />
        )}
        
        {/* MENÚ HAMBURGUESA */}
        {showHamburgerMenu && !centerCard && (
          <HamburgerMenu position="top-right" hasTopBar={showTopbar} />
        )}
        
        <KeyboardAvoidingView 
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={showTopbar ? 120 : 80}
        >
          <View style={[styles.modalContent, centerCard && styles.centerModalContent]}>
            <Card style={[
              styles.theCard, 
              cardMarginTop !== undefined && !centerCard 
                ? { marginTop: cardMarginTop } 
                : null,
              centerCard && styles.centerCard
            ]}>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>{title}</Text>
              </View>
              <Card.Content style={styles.cardContent}>
                <ScrollView
                  style={{ width: '100%' }}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {content}
                  {children}
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      mode={action.mode || "outlined"}
                      onPress={action.onPress}
                      style={[styles.button, action.style]}
                      labelStyle={styles.buttonLabel}
                      icon={action.icon}
                      textColor={action.textColor || "#5124A5"}
                      buttonColor={action.buttonColor || "white"}
                    >
                      {action.label}
                    </Button>
                  ))}
                </ScrollView>
              </Card.Content>
            </Card>

            {(isDetailModal || isEditModal) && (
              <View style={styles.buttonContainer}>
                {isDetailModal && (
                  <>
                    {canEdit && (
                      <Button
                        mode="contained"
                        onPress={onModifyPress}
                        style={styles.detailButton}
                        labelStyle={styles.detailButtonLabel}
                        buttonColor="#5124A5"
                      >
                        Modificar
                      </Button>
                    )}
                    <Button
                      mode="contained"
                      onPress={onGoToPlanPress}
                      style={styles.detailButton}
                      labelStyle={styles.detailButtonLabel}
                      buttonColor="#5124A5"
                    >
                      Ir a planilla
                    </Button>
                  </>
                )}
                {isEditModal && canEdit && (
                  <Button
                    mode="contained"
                    onPress={onSavePress}
                    style={styles.detailButton}
                    labelStyle={styles.detailButtonLabel}
                    buttonColor="#5124A5"
                  >
                    Guardar
                  </Button>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </PaperModal>
    </Portal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'white',
    width,
    height,
    justifyContent: 'flex-start',
    borderColor: '#5124A5',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerModalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: { 
    backgroundColor: '#5124A5',
    width: '100%',
    paddingVertical: 12,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  theCard: { 
    backgroundColor: '#ffffff',
    width: '95%',
    borderRadius: 50,
    marginVertical: 10,
    maxHeight: height * 0.6,
    overflow: 'hidden',
    marginTop: height * 0.2,
    alignSelf: 'center',
  },
  centerCard: { 
    marginTop: 0,
    marginVertical: 0,
    maxHeight: height * 0.4,
    width: '100%',
    borderRadius: 50,
    marginHorizontal: 0,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#5124A5',
    marginVertical: 10,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailButton: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  detailButtonLabel: {
    fontWeight: 'regular',
    fontSize: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  }
});

