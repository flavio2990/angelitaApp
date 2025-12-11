import React, { useEffect, useState } from 'react';
import { 
  Modal as PaperModal, 
  Portal, 
  Button, 
  Card 
} from 'react-native-paper';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  ScrollView, 
  KeyboardAvoidingView,
  Keyboard,
  Text,
  TouchableWithoutFeedback
} from 'react-native';

import TopBarHeader from '@/components/TopBarHeader';
import HamburgerMenu from './HamburgerMenu';
import VitalSignsColumns from './VitalSignsColumns';
import CustomButton from './CustomButton';
import { VITALS_TEXTS, FORM_TEXTS } from '../constants/Strings';

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
  onLogout,
  onGoHome,
  showGoHomeOption = true,
  scrollable = true,
  outsideActions = [],
  topbarMarginTop = 50,
  isVitalsModal = false,
  vitalsData = null,
  onVitalsSave = null,
  onVitalsModify = null,
  offsetWithTopbar = false,
  vitalsInfoMarginTop = 20,
  vitalsInfoExtraMargin = 0,
  hasVitalsData = false,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const resolvedTitle = (isVitalsModal && !children) ? VITALS_TEXTS.headerColumns : title;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);
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
        {showTopbar && (
          <View style={styles.topBarOverlay} pointerEvents="box-none">
            <TopBarHeader
              showTopBar={true}
              topBarTitle={topbarTitle}
              onBack={onBack}
              centerTopbarTitle={centerTopbarTitle}
              style={styles.topBarFloating}
            />
          </View>
        )}
        
        {/* MENÚ HAMBURGUESA */}
        {showHamburgerMenu && (
          <HamburgerMenu 
            position="top-right" 
            hasTopBar={showTopbar}
            onLogout={onLogout}
            onGoHome={onGoHome}
            showGoHomeOption={showGoHomeOption}
            showInModal={true}
            forceShow={true}
          />
        )}
        
        {/* Información del paciente para modales de signos vitales */}
        {isVitalsModal && vitalsData?.patientName && (
          <View style={[
            styles.patientBoxModal,
            {
              top: showTopbar
                ? (offsetWithTopbar
                    ? (topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin
                    : vitalsInfoMarginTop)
                : 16
            }
          ]}>
            <Text style={styles.patientTextModal}>
              {VITALS_TEXTS.patientLabelPrefix} {vitalsData.patientName}
            </Text>
          </View>
        )}
        
        {outsideActions.length > 0 && (
          <View style={[
            styles.outsideActionsContainer,
            { bottom: isKeyboardVisible ? 20 : 150 }
          ]}>
            {outsideActions.map((action, index) => (
              <Button
                key={index}
                mode={action.mode || "text"}
                onPress={action.onPress}
                style={[styles.outsideActionButton, action.style]}
                labelStyle={[styles.outsideActionLabel, action.labelStyle]}
                textColor={action.textColor || "#666"}
                buttonColor={action.buttonColor || "transparent"}
              >
                {action.label}
              </Button>
            ))}
          </View>
        )}

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {centerCard ? (
            <View style={styles.flex}>
              <View style={[
                styles.modalContent, 
                styles.centerModalContent,
                isVitalsModal && { 
                  justifyContent: 'flex-start',
                  paddingBottom: 0,
                  paddingTop: showTopbar 
                    ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90)
                    : 110
                }
              ]}>
                <Card style={[
                  styles.theCard, 
                  styles.centerCard,
                  isVitalsModal && styles.vitalsCard,
                  isVitalsModal && { marginTop: 0 }
                ]}>
                  {resolvedTitle && (
                    <View style={styles.titleWrapper}>
                      <Text style={styles.title}>{resolvedTitle}</Text>
                    </View>
                  )}
                  <Card.Content style={styles.cardContent}>
                    {isVitalsModal && !children ? (
                      <VitalSignsColumns
                        adminUid={vitalsData?.adminUid}
                        area={vitalsData?.area}
                        personId={vitalsData?.personId}
                        patientName={vitalsData?.patientName}
                        visible={visible}
                        onDismiss={onDismiss}
                        onModify={onVitalsModify}
                        onSave={onVitalsSave}
                      />
                    ) : scrollable ? (
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
                    ) : (
                      <View style={{ width: '100%' }}>
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
                      </View>
                    )}
                  </Card.Content>
                </Card>

                {(isDetailModal || isEditModal) && !(isVitalsModal && isKeyboardVisible) && (
                  <View style={[
                    styles.buttonContainer,
                    isVitalsModal && styles.vitalsButtonContainer,
                    isVitalsModal && { position: 'absolute', bottom: 0, left: 0, right: 0 }
                  ]}>
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
                      <>
                        {isVitalsModal ? (
                          <>
                            {onModifyPress && hasVitalsData && (
                              <CustomButton
                                onPress={onModifyPress}
                                label={FORM_TEXTS.editButton}
                                style={{ marginBottom: 15 }}
                              />
                            )}
                            <CustomButton
                              onPress={onSavePress}
                              label={FORM_TEXTS.saveButton}
                            />
                          </>
                        ) : (
                          <Button
                            mode="contained"
                            onPress={onSavePress}
                            style={styles.detailButton}
                            labelStyle={styles.detailButtonLabel}
                            buttonColor="#5124A5"
                          >
                            {FORM_TEXTS.saveButton}
                          </Button>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <KeyboardAvoidingView 
              style={styles.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={showTopbar ? 120 : 80}
            >
              <View style={[
                styles.modalContent,
                cardMarginTop === 0 && !showTopbar && styles.fullScreenModalContent,
                showTopbar && offsetWithTopbar && topbarMarginTop !== undefined && { paddingTop: topbarMarginTop },
                isVitalsModal && { paddingBottom: 20 }
              ]}>
                <Card style={[
                  styles.theCard, 
                  cardMarginTop !== undefined && { marginTop: cardMarginTop },
                  cardMarginTop === 0 && !showTopbar && styles.fullScreenCard,
                  isVitalsModal && styles.vitalsCard
                ]}>
                  {resolvedTitle && (
                    <View style={[
                      styles.titleWrapper,
                      cardMarginTop === 0 && styles.fullScreenTitleWrapper
                    ]}>
                      <Text style={styles.title}>{resolvedTitle}</Text>
                    </View>
                  )}
                  <Card.Content style={styles.cardContent}>
                    {isVitalsModal && !children ? (
                      <VitalSignsColumns
                        adminUid={vitalsData?.adminUid}
                        area={vitalsData?.area}
                        personId={vitalsData?.personId}
                        patientName={vitalsData?.patientName}
                        visible={visible}
                        onDismiss={onDismiss}
                        onModify={onVitalsModify}
                        onSave={onVitalsSave}
                      />
                    ) : scrollable ? (
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
                    ) : (
                      <View style={{ width: '100%' }}>
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
                      </View>
                    )}
                  </Card.Content>
                </Card>

                {(isDetailModal || isEditModal) && (
                  <View style={[
                    styles.buttonContainer,
                    isVitalsModal && styles.vitalsButtonContainer
                  ]}>
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
                      <>
                        {isVitalsModal ? (
                          <>
                            {onModifyPress && hasVitalsData && (
                              <CustomButton
                                onPress={onModifyPress}
                                label={FORM_TEXTS.editButton}
                                style={{ marginBottom: 15 }}
                              />
                            )}
                            <CustomButton
                              onPress={onSavePress}
                              label={FORM_TEXTS.saveButton}
                            />
                          </>
                        ) : (
                          <Button
                            mode="contained"
                            onPress={onSavePress}
                            style={styles.detailButton}
                            labelStyle={styles.detailButtonLabel}
                            buttonColor="#5124A5"
                          >
                            {FORM_TEXTS.saveButton}
                          </Button>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          )}
        </TouchableWithoutFeedback>
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
    zIndex: 9999,
    elevation: 9999,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 10000,
    elevation: 10000,
  },
  fullScreenModalContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  centerModalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  titleWrapper: { 
    backgroundColor: '#5124A5',
    width: '100%',
    paddingVertical: 12,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  fullScreenTitleWrapper: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
    zIndex: 10001,
    elevation: 10001,
  },
  fullScreenCard: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    marginTop: 0,
    marginVertical: 0,
    maxHeight: '100%',
    alignSelf: 'stretch',
  },
  centerCard: { 
    marginTop: 0,
    marginVertical: 0,
    maxHeight: height * 0.4,
    width: width - 20, // Ancho completo menos un pequeño margen
    borderRadius: 50,
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  vitalsCard: {
    width: '95%',
    maxHeight: height * 0.55,
    borderRadius: 50,
    marginHorizontal: 'auto',
    marginBottom: -5,
    marginTop: height * 0.25,
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
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20001,
    elevation: 20001,
  },
  topBarFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    zIndex: 10002,
    elevation: 10002,
  },
  vitalsButtonContainer: {
    paddingVertical: 10,
    paddingTop: 10,
    paddingBottom: 20,
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  outsideActionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20000,
    elevation: 20000,
  },
  outsideActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  outsideActionLabel: {
    fontSize: 16,
    fontWeight: 'normal',
    textDecorationLine: 'none',
  },
  // Estilos para el patientBox en modales de signos vitales
  patientBoxModal: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    zIndex: 10001,
    elevation: 10001,
    marginBottom: 16,
  },
  patientTextModal: {
    fontSize: 24,
    color: '#5124A5',
    fontWeight: 'bold',
  }
});

