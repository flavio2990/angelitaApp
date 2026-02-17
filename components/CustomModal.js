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
  Alert,
  ActivityIndicator
} from 'react-native';

import TopBarHeader from '@/components/TopBarHeader';
import HamburgerMenu from './HamburgerMenu';
import VitalSignsColumns from './VitalSignsColumns';
import CustomButton from './CustomButton';
import VitalsDetails from './VitalsDetails';
import MedicationDetails from './MedicationDetails';
import MedicationAdminList from './MedicationAdminList';
import { VITALS_TEXTS, FORM_TEXTS, MEDICATION_TEXTS, PERSON_TYPE_TEXTS } from '../constants/Strings';
import { Calendar } from 'react-native-calendars';
import { useHistoryCalendar } from './hooks/useHistoryCalendar';
import AuthorRoleSelector from './AuthorRoleSelector';

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
  medicationHistoryByDate = {},
  selectedAuthorRole = 'employee',
  onAuthorRoleChange = null,
  isLoadingMedication = false,
  onAdminPress = null,
  showMedicationAdmin = false,
  adminMedications = [],
  medicationSheetId = null,
  onAdminCheckChange = null,
  medicationAdministrationState = {},
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const resolvedTitle = (isVitalsModal && !children) ? VITALS_TEXTS.headerColumns : (isMedicationModal && children ? `${MEDICATION_TEXTS.columns.droga}/${MEDICATION_TEXTS.columns.hora}/${MEDICATION_TEXTS.columns.dosis}` : title);

  const vitalsHistoryCalendar = useHistoryCalendar({
    historyByDate: vitalsHistoryByDate,
    currentPersonId: vitalsData?.personId,
    onSelect: onViewHistory,
    initialSelectedRecord: isVitalsModal ? previousVitalsData : null,
    alertTitle: 'Signos y Constantes',
    noDataMessage: 'No hay datos de signos vitales disponibles para la fecha seleccionada.',
    futureDateMessage: 'No se pueden seleccionar fechas futuras.',
  });

  const medicationHistoryCalendar = useHistoryCalendar({
    historyByDate: medicationHistoryByDate,
    currentPersonId: vitalsData?.personId,
    initialSelectedRecord: isMedicationModal ? previousVitalsData : null,
    alertTitle: 'Medicación',
    noDataMessage: 'No hay datos de medicación disponibles para la fecha seleccionada.',
    futureDateMessage: 'No se pueden seleccionar fechas futuras.',
  });

  const historyCalendar = isMedicationModal ? medicationHistoryCalendar : vitalsHistoryCalendar;
  const {
    showCalendar: showHistoryCalendar,
    selectedDate,
    selectedRecord: historySelectedData,
    selectionAttempted: historySelectionAttempted,
    openCalendar: handleViewHistory,
    closeCalendar: handleCancelHistory,
    handleDayPress,
  } = historyCalendar;

  const isAnteriorView = vitalsView === 'anterior';
  const isHistoryMode = isAnteriorView && (isVitalsModal || (isMedicationModal && !showMedicationAdmin));

  const getPersonLabelPrefix = () => {
    const personType = vitalsData?.personType;
    if (!personType) return isMedicationModal ? MEDICATION_TEXTS.patientLabelPrefix : VITALS_TEXTS.patientLabelPrefix;
    
    const tipoLower = personType.toLowerCase();
    if (tipoLower === PERSON_TYPE_TEXTS.patient.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.patient}:`;
    } else if (tipoLower === PERSON_TYPE_TEXTS.nursing.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.nursing}:`;
    } else if (tipoLower === PERSON_TYPE_TEXTS.administrator.toLowerCase()) {
      return `_${PERSON_TYPE_TEXTS.administrator}:`;
    }
    return `_${personType}:`;
  };

  const renderHistoryFooter = () => {
    if (!isHistoryMode || isKeyboardVisible || !(previousVitalsData || hasVitalsData)) {
      return null;
    }

    return (
      <View style={[styles.buttonContainer, styles.vitalsButtonContainer, styles.viewHistoryWrapper]}>
        <CustomButton
          onPress={showHistoryCalendar ? handleCancelHistory : handleViewHistory}
          label={showHistoryCalendar ? VITALS_TEXTS.cancelHistoryButton : VITALS_TEXTS.viewHistoryButton}
          style={{ width: '95%' }}
        />
      </View>
    );
  };

  const renderAdminFooter = () => {
    if (!showMedicationAdmin || !isMedicationModal) {
      return null;
    }

    return (
      <View style={[
        styles.medicationButtonContainer,
        {
          backgroundColor: 'transparent',
          position: 'absolute',
          marginTop: '10%',
          left: 0,
          right: 0,
          zIndex: 10002,
          elevation: 10002,
          width: '100%',
          alignItems: 'center',
        }
      ]}>
        <CustomButton
          onPress={onSavePress}
          label={FORM_TEXTS.saveButton}
          style={{ width: '90%', maxWidth: 400 }}
        />
        <CustomButton
          onPress={showHistoryCalendar ? handleCancelHistory : handleViewHistory}
          label={showHistoryCalendar ? VITALS_TEXTS.cancelHistoryButton : VITALS_TEXTS.viewHistoryButton}
          style={{ width: '90%', maxWidth: 400, marginTop: 12 }}
        />
      </View>
    );
  };

  const renderEditFooter = () => {
    if (isHistoryMode || showMedicationAdmin) {
      return null;
    }

    if (!isDetailModal && !isEditModal) {
      return null;
    }

    if (isVitalsModal && isKeyboardVisible) {
      return null;
    }

    const buttonStyle = [
      styles.buttonContainer,
      isVitalsModal && styles.vitalsButtonContainer,
      isVitalsModal && { position: 'absolute', bottom: 0, left: 0, right: 0 },
      isMedicationModal && styles.medicationButtonContainer
    ];

    return (
      <View style={buttonStyle}>
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
                {isMedicationModal && !showMedicationAdmin && (
                  <CustomButton
                    onPress={onAdminPress}
                    label="Administrar"
                    style={isMedicationModal ? { width: '100%', maxWidth: 400, marginTop: 15 } : {}}
                  />
                )}
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
    );
  };

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
      handleCancelHistory(true);
    }
  }, [visible, vitalsView, handleCancelHistory]);

  const renderCardContent = () => {
    if (isVitalsModal && vitalsView === 'anterior') {
      if (showHistoryCalendar) {
        return (
          <View style={{ width: '100%', gap: 12 }}>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#5124A5' }
              }}
              theme={{
                selectedDayBackgroundColor: '#5124A5',
                todayTextColor: '#5124A5',
                arrowColor: '#5124A5',
                textDisabledColor: '#d3d3d3',
              }}
            />
          </View>
        );
      }
      return <VitalsDetails vitalsData={historySelectedData || previousVitalsData} />;
    }

    if (isMedicationModal && vitalsView === 'anterior') {
      if (showHistoryCalendar) {
        return (
          <View style={{ width: '100%', gap: 12 }}>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#5124A5' }
              }}
              theme={{
                selectedDayBackgroundColor: '#5124A5',
                todayTextColor: '#5124A5',
                arrowColor: '#5124A5',
                textDisabledColor: '#d3d3d3',
              }}
            />
          </View>
        );
      }
      
      if (isLoadingMedication) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5124A5" />
            <Text style={styles.loadingText}>Cargando medicación...</Text>
          </View>
        );
      }
      
      return <MedicationDetails medicationData={historySelectedData || previousVitalsData} />;
    }

    // Si es modal de vitals y no hay children
    if (isVitalsModal && !children) {
      return (
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
      );
    }

    // Si es modal de medicación en modo administración
    if (isMedicationModal && showMedicationAdmin) {
      if (showHistoryCalendar) {
        return (
          <View style={{ width: '100%', gap: 12 }}>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#5124A5' }
              }}
              theme={{
                selectedDayBackgroundColor: '#5124A5',
                todayTextColor: '#5124A5',
                arrowColor: '#5124A5',
                textDisabledColor: '#d3d3d3',
              }}
            />
          </View>
        );
      }

      const adminHistoryMedications =
        historySelectedData?.medicationsList ||
        historySelectedData?.medications ||
        adminMedications;
      const adminHistoryAdministration =
        historySelectedData?.medications?.administration ||
        medicationAdministrationState;

      return (
        <MedicationAdminList
          medications={adminHistoryMedications}
          medId={historySelectedData?.firebaseKey || medicationSheetId}
          personId={vitalsData?.personId}
          area={vitalsData?.area}
          uid={vitalsData?.adminUid}
          onAdminCheckChange={onAdminCheckChange}
          administrationState={adminHistoryAdministration}
        />
      );
    }

    // Si es modal de medicación
    if (isMedicationModal) {
      return children;
    }

    // Caso default: contenido genérico con scroll o sin scroll
    const defaultContent = (
      <>
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
      </>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {defaultContent}
        </ScrollView>
      );
    }

    return <View style={{ width: '100%' }}>{defaultContent}</View>;
  };

  const renderCardWithButtons = () => {
    const cardElement = (
      <Card 
        style={[
          // Para medicación vista anterior, siempre usar vitalsCard para mantener ancho consistente
          isMedicationModal && vitalsView === 'anterior' ? styles.vitalsCard : (isMedicationModal ? styles.medicationCard : styles.theCard),
          !(isVitalsModal && vitalsView === 'anterior') && !isMedicationModal && styles.centerCard,
          !isMedicationModal && cardMarginTop !== undefined && { marginTop: cardMarginTop },
          !isMedicationModal && cardMarginTop === 0 && !showTopbar && styles.fullScreenCard,
          isVitalsModal && vitalsView === 'anterior' && styles.vitalsCard,
          isVitalsModal && vitalsView === 'nuevo' && styles.vitalsCardNew,
          isVitalsModal && { marginTop: 0 },
          isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { marginTop: '20%' },
          isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && { marginTop: 0 },
            isMedicationModal && showMedicationAdmin && vitalsView !== 'anterior' && { marginTop: '15%' },
          isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && { marginTop: 0 },
          isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && {
            maxHeight: height * 0.6,
            minHeight: 350,
          },
          isMedicationModal && showMedicationAdmin && vitalsView !== 'anterior' && {
            maxHeight: height * 0.5,
            minHeight: 300,
            marginBottom: 40,
          },
          isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && {
            maxHeight: height * 0.6,
          }
        ]}
        pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'auto' : undefined}
      >
        {resolvedTitle && (
          <View style={[
            styles.titleWrapper,
            cardMarginTop === 0 && styles.fullScreenTitleWrapper,
            isMedicationModal && vitalsView !== 'anterior' && styles.medicationTitleWrapper
          ]}>
            {isMedicationModal && showMedicationAdmin ? (
              <View style={styles.medicationTitleRow}>
                <Text style={[styles.title, styles.medicationTitleDroga]}>
                  {MEDICATION_TEXTS.columns.droga}
                </Text>
                <Text style={[styles.title, styles.medicationTitleDosis]}>
                  {MEDICATION_TEXTS.columns.dosis}
                </Text>
                <Text style={[styles.title, styles.medicationTitleHora]}>
                  {MEDICATION_TEXTS.columns.hora}
                </Text>
                <Text style={[styles.title, styles.medicationTitleRealizado]}>
                  Hecho
                </Text>
              </View>
            ) : isMedicationModal && vitalsView === 'anterior' ? (
              <Text style={styles.title}>
                {title}
              </Text>
            ) : isMedicationModal ? (
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
        <Card.Content 
          style={[
            !(isMedicationModal && vitalsView === 'anterior') && !(isMedicationModal && showMedicationAdmin) && styles.cardContent, 
            isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && styles.medicationCardContent,
            isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { padding: 0, width: '100%' },
            isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && { 
              width: '100%',
              minHeight: 300,
              padding: 0,
              flexGrow: 1,
            },
            isMedicationModal && showMedicationAdmin && {
              width: '100%',
              padding: 0,
              maxHeight: 300,
              flexGrow: 0,
            },
            isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && {
              flexShrink: 1,
            }
          ]}
          pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'box-none' : 'auto'}
          onStartShouldSetResponder={() => false}
        >
          {renderCardContent()}
        </Card.Content>
      </Card>
    );

    return (
      <>
        {isMedicationModal && vitalsView === 'anterior' && onAuthorRoleChange && !showHistoryCalendar && !showMedicationAdmin && (
          <View style={styles.authorSelectorContainer}>
            <AuthorRoleSelector
              selectedRole={selectedAuthorRole}
              onRoleChange={onAuthorRoleChange}
            />
          </View>
        )}
        <View style={[
          isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && !showMedicationAdmin ? { marginTop: 0 } : {},
          showMedicationAdmin && { paddingBottom: 0 }
        ]}>
          {cardElement}
        </View>
        {showMedicationAdmin && isMedicationModal ? (
          <View style={{ position: 'relative', width: '100%', minHeight: 150 }}>
            {renderAdminFooter()}
          </View>
        ) : (isHistoryMode ? renderHistoryFooter() : renderEditFooter())}
      </>
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
              {`${getPersonLabelPrefix()} ${vitalsData.patientName}`}
            </Text>
          </View>
        )}

        {(isVitalsModal || (isMedicationModal && !showMedicationAdmin)) && showTopbar && (
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
              {`${getPersonLabelPrefix()} ${vitalsData.patientName}`}
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

        {(isMedicationModal && vitalsView === 'anterior') || (isMedicationModal && showMedicationAdmin) ? (
          <View style={styles.flex}>
            {centerCard ? (
              <View style={styles.flex}>
                <View 
                  style={[
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
                      paddingTop: vitalsView === 'anterior'
                        ? (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 30) : 50)
                        : showMedicationAdmin && vitalsView !== 'anterior'
                          ? (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 30) : 50)
                          : (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90) : 110),
                      paddingBottom: showMedicationAdmin && vitalsView !== 'anterior' ? 100 : 0
                    }
                  ]}
                  pointerEvents="box-none"
                >
                  {renderCardWithButtons()}
                </View>
              </View>
            ) : (
              <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={showTopbar ? 120 : 80}
              >
                <View 
                  style={[
                    styles.modalContent,
                    cardMarginTop === 0 && !showTopbar && styles.fullScreenModalContent,
                    showTopbar && offsetWithTopbar && topbarMarginTop !== undefined && { paddingTop: topbarMarginTop },
                    isVitalsModal && { paddingBottom: 20 },
                    isMedicationModal && {
                      justifyContent: 'flex-start',
                      alignItems: 'stretch',
                      paddingTop: vitalsView === 'anterior'
                        ? (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 30) : 50)
                        : showMedicationAdmin && vitalsView !== 'anterior'
                          ? (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 30) : 50)
                          : (showTopbar ? ((topbarMarginTop || vitalsInfoMarginTop) + vitalsInfoExtraMargin + 90) : 110),
                      paddingBottom: showMedicationAdmin && vitalsView !== 'anterior' ? 100 : 0
                    }
                  ]}
                  pointerEvents="box-none"
                >
                  {renderCardWithButtons()}
                </View>
              </KeyboardAvoidingView>
            )}
          </View>
        ) : (
              <TouchableWithoutFeedback 
            onPress={() => {
              Keyboard.dismiss();
            }} 
            accessible={false}
            onStartShouldSetResponder={() => false}
            onMoveShouldSetResponder={() => {
              return false;
            }}
          >
          {centerCard ? (
            <View style={styles.flex}>
              <View 
                style={[
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
                ]}
                pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'box-none' : 'auto'}
              >
                <Card 
                  style={[
                    isMedicationModal && vitalsView === 'anterior' ? styles.vitalsCard : (isMedicationModal ? styles.medicationCard : styles.theCard),
                    !(isVitalsModal && vitalsView === 'anterior') && !isMedicationModal && styles.centerCard,
                    isVitalsModal && vitalsView === 'anterior' && styles.vitalsCard,
                    isVitalsModal && vitalsView === 'nuevo' && styles.vitalsCardNew,
                    isVitalsModal && { marginTop: 0 },
                    isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { marginTop: 24 },
                    isMedicationModal && vitalsView !== 'anterior' && { marginTop: 0 },
                    isMedicationModal && {
                      maxHeight: height * 0.6,
                    }
                  ]}
                  pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'auto' : undefined}
                >
                  {resolvedTitle && (
                    <View style={[
                      styles.titleWrapper,
                      isMedicationModal && vitalsView !== 'anterior' && styles.medicationTitleWrapper
                    ]}>
                      {isMedicationModal && vitalsView === 'anterior' ? (
                        <Text style={styles.title}>
                          {title}
                        </Text>
                      ) : isMedicationModal ? (
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
                  <Card.Content 
                    style={[
                      !(isMedicationModal && vitalsView === 'anterior') && styles.cardContent, 
                      isMedicationModal && vitalsView !== 'anterior' && styles.medicationCardContent,
                      isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { padding: 0, width: '100%' },
                      isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && { 
                        width: '100%',
                        minHeight: 300,
                        padding: 0,
                        flexGrow: 1,
                      },
                      isMedicationModal && vitalsView !== 'anterior' && {
                        flexShrink: 1,
                      }
                    ]}
                    pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'box-none' : 'auto'}
                  >
                    {renderCardContent()}
                  </Card.Content>
                </Card>

                {showMedicationAdmin ? (
                  <View style={{ position: 'relative', width: '100%', minHeight: 150 }}>
                    {renderAdminFooter()}
                  </View>
                ) : (isHistoryMode ? renderHistoryFooter() : renderEditFooter())}
              </View>
            </View>
          ) : (
            <KeyboardAvoidingView
              style={styles.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={showTopbar ? 120 : 80}
            >
              <View 
                style={[
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
                ]}
                pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'box-none' : 'auto'}
              >
                <Card 
                  style={[
                    isMedicationModal && vitalsView === 'anterior' ? styles.vitalsCard : (isMedicationModal ? styles.medicationCard : styles.theCard),
                    !isMedicationModal && cardMarginTop !== undefined && { marginTop: cardMarginTop },
                    !isMedicationModal && cardMarginTop === 0 && !showTopbar && styles.fullScreenCard,
                    isVitalsModal && vitalsView === 'anterior' && styles.vitalsCard,
                    isVitalsModal && vitalsView === 'nuevo' && styles.vitalsCardNew,
                    isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { marginTop: 24 },
                    isMedicationModal && vitalsView !== 'anterior' && { marginTop: 0 },
                    isMedicationModal && vitalsView !== 'anterior' && {
                      maxHeight: height * 0.6,
                    }
                  ]}
                  pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'auto' : undefined}
                >
                  {resolvedTitle && (
                    <View style={[
                      styles.titleWrapper,
                      cardMarginTop === 0 && styles.fullScreenTitleWrapper,
                      isMedicationModal && vitalsView !== 'anterior' && styles.medicationTitleWrapper
                    ]}>
                      {isMedicationModal && vitalsView === 'anterior' ? (
                        <Text style={styles.title}>
                          {title}
                        </Text>
                      ) : isMedicationModal ? (
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
        <Card.Content 
          style={[
            !(isMedicationModal && vitalsView === 'anterior') && !(isMedicationModal && showMedicationAdmin) && styles.cardContent, 
            isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && styles.medicationCardContent,
            isMedicationModal && vitalsView === 'anterior' && showHistoryCalendar && { padding: 0, width: '100%' },
            isMedicationModal && vitalsView === 'anterior' && !showHistoryCalendar && { 
              width: '100%',
              minHeight: 300,
              padding: 0,
              flexGrow: 1,
            },
            isMedicationModal && showMedicationAdmin && {
              width: '100%',
              padding: 0,
              maxHeight: 300,
              flexGrow: 0,
            },
            isMedicationModal && vitalsView !== 'anterior' && !showMedicationAdmin && {
              flexShrink: 1,
            }
          ]}
          pointerEvents={isMedicationModal && vitalsView === 'anterior' ? 'box-none' : 'auto'}
          onStartShouldSetResponder={() => false}
        >
          {renderCardContent()}
        </Card.Content>
                </Card>

                {showMedicationAdmin ? (
                  <View style={{ position: 'relative', width: '100%', minHeight: 150 }}>
                    {renderAdminFooter()}
                  </View>
                ) : (isHistoryMode ? renderHistoryFooter() : renderEditFooter())}
              </View>
            </KeyboardAvoidingView>
          )}
        </TouchableWithoutFeedback>
        )}
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
    backgroundColor: '#ffffff',
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
    maxWidth: '97%',
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 'auto',
    marginBottom: 'auto',
    marginTop: height * 0.25,
    alignSelf: 'center',
  },
  medicationCardContent: {
    flex: 1,
    maxHeight: height * 0.4,
    minHeight: 200,
    overflow: 'hidden',
  },
  medicationButtonContainer: {
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 20,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    minHeight: 80,
  },
  medicationTitleWrapper: {
    flexDirection: 'row'
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
  medicationTitleRealizado: {
    textAlign: 'center',
  },
  authorSelectorContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

