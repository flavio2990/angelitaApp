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
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert
} from 'react-native';

import TopBarHeader from '@/components/TopBarHeader';
import HamburgerMenu from './HamburgerMenu';
import VitalSignsColumns from './VitalSignsColumns';
import CustomButton from './CustomButton';
import VitalsDetails from './VitalsDetails';
import { VITALS_TEXTS, FORM_TEXTS, MEDICATION_TEXTS } from '../constants/Strings';
import { Calendar } from 'react-native-calendars';

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
  isMedicationModal = false,
  vitalsData = null,
  onVitalsSave = null,
  onVitalsModify = null,
  offsetWithTopbar = false,
  vitalsInfoMarginTop = 20,
  vitalsInfoExtraMargin = 0,
  hasVitalsData = false,
  vitalsView = 'nuevo',
  onVitalsViewChange = null,
  previousVitalsData = null,
  vitalsHistoryByDate = {},
  onViewHistory = null,
  medicationCount = 1,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showHistoryCalendar, setShowHistoryCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historySelectedData, setHistorySelectedData] = useState(null);
  const [historySelectionAttempted, setHistorySelectionAttempted] = useState(false);
  const resolvedTitle = (isVitalsModal && !children) ? VITALS_TEXTS.headerColumns : (isMedicationModal && children ? `${MEDICATION_TEXTS.columns.droga}/${MEDICATION_TEXTS.columns.hora}/${MEDICATION_TEXTS.columns.dosis}` : title);

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

  useEffect(() => {
    if (!visible || vitalsView !== 'anterior') {
      setShowHistoryCalendar(false);
      setHistorySelectedData(null);
      setHistorySelectionAttempted(false);
    }
  }, [visible, vitalsView]);

  const handleViewHistory = () => {
    setShowHistoryCalendar(true);
    setSelectedDate(previousVitalsData?.createdAt ? new Date(previousVitalsData.createdAt) : new Date());
    setHistorySelectedData(null);
    setHistorySelectionAttempted(false);
    if (onViewHistory) onViewHistory();
  };

  const handleCancelHistory = () => {
    setShowHistoryCalendar(false);
    setHistorySelectedData(null);
    setHistorySelectionAttempted(false);
  };

  const handleDayPress = (day) => {
    const pickedKey = day.dateString; 
    const picked = new Date(pickedKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickedDate = new Date(picked);
    pickedDate.setHours(0, 0, 0, 0);

    if (pickedDate > today) {
      Alert.alert(
        'Signos y Constantes',
        'No se pueden seleccionar fechas futuras.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedDate(picked);
    setHistorySelectionAttempted(true);

    const recordForDate = vitalsHistoryByDate[pickedKey];

    if (recordForDate && vitalsData?.personId) {
      if (recordForDate.personId === vitalsData.personId) {
        setHistorySelectedData(recordForDate);
        setShowHistoryCalendar(false); 
        return;
      }
    }

    setHistorySelectedData(null);
    Alert.alert(
      'Signos y Constantes',
      'No hay datos de signos vitales disponibles para la fecha seleccionada.',
      [{ text: 'OK' }]
    );
  };
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

        {((isVitalsModal || isMedicationModal) && vitalsData?.patientName) && (
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
              {isMedicationModal 
                ? `${MEDICATION_TEXTS.patientLabelPrefix} ${vitalsData.patientName}`
                : `${VITALS_TEXTS.patientLabelPrefix} ${vitalsData.patientName}`
              }
            </Text>
          </View>
        )}

        {isVitalsModal && showTopbar && (
          <View style={[
            styles.vitalsViewButtons,
            {
              top: showTopbar
                ? (offsetWithTopbar
                  ? (topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin - 50
                  : vitalsInfoMarginTop - 50)
                : 16
            }
          ]}>
            <TouchableOpacity
              onPress={() => onVitalsViewChange && onVitalsViewChange('anterior')}
              style={styles.vitalsViewButton}
            >
              <Text style={[
                styles.vitalsViewButtonText,
                vitalsView === 'anterior' && styles.vitalsViewButtonTextActive
              ]}>
                Anterior
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onVitalsViewChange && onVitalsViewChange('nuevo')}
              style={styles.vitalsViewButton}
            >
              <Text style={[
                styles.vitalsViewButtonText,
                vitalsView === 'nuevo' && styles.vitalsViewButtonTextActive
              ]}>
                Nuevo
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

        {((isVitalsModal || isMedicationModal) && vitalsData?.patientName) && (
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
              {isMedicationModal 
                ? `${MEDICATION_TEXTS.patientLabelPrefix} ${vitalsData.patientName}`
                : `${VITALS_TEXTS.patientLabelPrefix} ${vitalsData.patientName}`
              }
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
                !isMedicationModal && styles.centerModalContent,
                isVitalsModal && {
                  justifyContent: 'flex-start',
                  paddingBottom: 0,
                  paddingTop: showTopbar
                    ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90)
                    : 110
                },
                isMedicationModal && {
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  paddingTop: showTopbar
                    ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90)
                    : 110
                }
              ]}>
                <Card style={[
                  isMedicationModal ? styles.medicationCard : styles.theCard,
                  !(isVitalsModal && vitalsView === 'anterior') && !isMedicationModal && styles.centerCard,
                  isVitalsModal && vitalsView === 'anterior' && styles.vitalsCard,
                  isVitalsModal && vitalsView === 'nuevo' && styles.vitalsCardNew,
                  isVitalsModal && { marginTop: 0 },
                  isMedicationModal && { marginTop: 0 },
                  isMedicationModal && {
                    maxHeight: height * 0.6,
                  }
                ]}>
                  {resolvedTitle && (
                    <View style={[
                      styles.titleWrapper,
                      isMedicationModal && styles.medicationTitleWrapper
                    ]}>
                      {isMedicationModal ? (
                        <View style={styles.medicationTitleRow}>
                          <Text style={[styles.title, styles.medicationTitleDroga]}>
                            {MEDICATION_TEXTS.columns.droga}
                          </Text>
                          <Text style={[styles.title, styles.medicationTitleHora]}>
                            {MEDICATION_TEXTS.columns.hora}
                          </Text>
                          <Text style={[styles.title, styles.medicationTitleDosis]}>
                            {MEDICATION_TEXTS.columns.dosis}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.title}>
                          {isVitalsModal && vitalsView === 'anterior' ? 'Signos y Constantes' : resolvedTitle}
                        </Text>
                      )}
                    </View>
                  )}
                  <Card.Content style={[styles.cardContent, isMedicationModal && styles.medicationCardContent]}>
                    {isVitalsModal && vitalsView === 'anterior' ? (
                      showHistoryCalendar ? (
                        <View style={{ width: '100%', gap: 12 }}>
                          <Calendar
                            current={selectedDate.toISOString().split('T')[0]}
                            maxDate={new Date().toISOString().split('T')[0]}
                            onDayPress={handleDayPress}
                            markedDates={{
                              [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#5124A5' }
                            }}
                            style={styles.calendar}
                            theme={{
                              selectedDayBackgroundColor: '#5124A5',
                              todayTextColor: '#5124A5',
                              arrowColor: '#5124A5',
                              textDisabledColor: '#d3d3d3',
                            }}
                          />
                        </View>
                      ) : (
                        <VitalsDetails vitalsData={historySelectedData || previousVitalsData} />
                      )
                    ) : isVitalsModal && !children ? (
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
                    ) : isMedicationModal ? (
                      children
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

                {isVitalsModal && vitalsView === 'anterior' && !isKeyboardVisible && (previousVitalsData || hasVitalsData) && (
                  <View style={[styles.buttonContainer, styles.vitalsButtonContainer, styles.viewHistoryWrapper]}>
                    <CustomButton
                      onPress={showHistoryCalendar ? handleCancelHistory : handleViewHistory}
                      label={showHistoryCalendar ? VITALS_TEXTS.cancelHistoryButton : VITALS_TEXTS.viewHistoryButton}
                    />
                  </View>
                )}

                {(isDetailModal || (isEditModal && !(isVitalsModal && vitalsView === 'anterior'))) && !(isVitalsModal && isKeyboardVisible) && (
                  <View style={[
                    styles.buttonContainer,
                    isVitalsModal && styles.vitalsButtonContainer,
                    isVitalsModal && { position: 'absolute', bottom: 0, left: 0, right: 0 },
                    isMedicationModal && styles.medicationButtonContainer
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
                        {(isVitalsModal || isMedicationModal) ? (
                          <>
                            {onModifyPress && hasVitalsData && !isMedicationModal && (
                              <CustomButton
                                onPress={onModifyPress}
                                label={FORM_TEXTS.editButton}
                                style={{ marginBottom: 15 }}
                              />
                            )}
                            <CustomButton
                              onPress={onSavePress}
                              label={FORM_TEXTS.saveButton}
                              style={isMedicationModal ? { width: '100%', maxWidth: 400 } : {}}
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
                isVitalsModal && { paddingBottom: 20 },
                isMedicationModal && {
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                  paddingTop: showTopbar
                    ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90)
                    : 110
                }
              ]}>
                <Card style={[
                  isMedicationModal ? styles.medicationCard : styles.theCard,
                  !isMedicationModal && cardMarginTop !== undefined && { marginTop: cardMarginTop },
                  !isMedicationModal && cardMarginTop === 0 && !showTopbar && styles.fullScreenCard,
                  isVitalsModal && vitalsView === 'anterior' && styles.vitalsCard,
                  isVitalsModal && vitalsView === 'nuevo' && styles.vitalsCardNew,
                  isMedicationModal && { marginTop: 0 },
                  isMedicationModal && {
                    height: medicationCount ? (
                      medicationCount <= 3
                        ? 60 + (medicationCount * 70) + 50
                        : height * 0.6
                    ) : height * 0.4,
                    maxHeight: height * 0.6,
                  }
                ]}>
                  {resolvedTitle && (
                    <View style={[
                      styles.titleWrapper,
                      cardMarginTop === 0 && styles.fullScreenTitleWrapper,
                      isMedicationModal && styles.medicationTitleWrapper
                    ]}>
                      {isMedicationModal ? (
                        <View style={styles.medicationTitleRow}>
                          <Text style={[styles.title, styles.medicationTitleDroga]}>
                            {MEDICATION_TEXTS.columns.droga}
                          </Text>
                          <Text style={[styles.title, styles.medicationTitleHora]}>
                            {MEDICATION_TEXTS.columns.hora}
                          </Text>
                          <Text style={[styles.title, styles.medicationTitleDosis]}>
                            {MEDICATION_TEXTS.columns.dosis}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.title}>
                          {isVitalsModal && vitalsView === 'anterior' ? 'Signos y Constantes' : resolvedTitle}
                        </Text>
                      )}
                    </View>
                  )}
                  <Card.Content style={[styles.cardContent, isMedicationModal && styles.medicationCardContent]}>
                    {isVitalsModal && vitalsView === 'anterior' ? (
                      <VitalsDetails vitalsData={previousVitalsData} />
                    ) : isVitalsModal && !children ? (
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
                    ) : isMedicationModal ? (
                      children
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
                        {(isVitalsModal || isMedicationModal) ? (
                          <>
                            {onModifyPress && hasVitalsData && !isMedicationModal && (
                              <CustomButton
                                onPress={onModifyPress}
                                label={FORM_TEXTS.editButton}
                                style={{ marginBottom: 15 }}
                              />
                            )}
                            <CustomButton
                              onPress={onSavePress}
                              label={FORM_TEXTS.saveButton}
                              style={isMedicationModal ? { width: '100%', maxWidth: 400 } : {}}
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
    color: '#ffffff',
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
    width: width - 20, 
    borderRadius: 50,
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  vitalsCardDetails: {
    maxHeight: height * 0.9,
    minHeight: height * 0.7,
    width: '95%',
  },
  vitalsCard: {
    width: width - 20, 
    maxHeight: height * 0.55,
    borderRadius: 50,
    marginHorizontal: 10,
    marginBottom: -5,
    marginTop: height * 0.25,
    alignSelf: 'center',
  },
  vitalsCardNew: {
    width: '95%',
    maxHeight: height * 0.6,
    borderRadius: 50,
    marginHorizontal: 'auto',
    marginBottom: -5,
    marginTop: height * 0.25,
    alignSelf: 'center',
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
  calendar: {
    width: '100%',
  },
  noDataContainer: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  viewHistoryWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 20,
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
  },
  vitalsViewButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    zIndex: 20000,
    elevation: 20000,
  },
  vitalsViewButton: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginHorizontal: 36,
  },
  vitalsViewButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  vitalsViewButtonTextActive: {
    color: '#5124A5',
    fontWeight: 'normal',
  },
  medicationCard: {
    backgroundColor: '#ffffff',
    maxWidth: '95%',
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 'auto',
    marginBottom: 'auto',
    marginTop: height * 0.25,
    alignSelf: 'center',
  },
  medicationCardContent: {
    flex: 1,
    paddingTop: 8,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
  },

  medicationButtonContainer: {
    marginTop: 20,
    paddingTop: 0,
    paddingBottom: 20,
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  medicationTitleWrapper: {
    flexDirection: 'row',
  },
  medicationTitleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  medicationTitleDroga: {
    textAlign: 'center',
    marginRight: 8,
  },
  medicationTitleHora: {
    textAlign: 'center',
    marginRight: 8,
  },
  medicationTitleDosis: {
    textAlign: 'center',
  },
});

