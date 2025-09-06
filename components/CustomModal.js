import { Modal as PaperModal, Portal, Text, Button, Card, IconButton } from 'react-native-paper';
import { View, StyleSheet, Dimensions, StatusBar, Platform, ScrollView } from 'react-native';

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
  showHamburgerMenu = true, // Controla si se muestra el menú hamburguesa
  canEdit = false, // Controla si se pueden mostrar botones de edición
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
        {showTopbar && (
          <TopBarHeader
            showTopBar={true}
            topBarTitle={topbarTitle}
            onBack={onBack}
            centerTitle={centerTopbarTitle}
          />
        )}
        
        {/* MENÚ HAMBURGUESA - SOLO CUANDO HAY ROL ESTABLECIDO */}
        {showHamburgerMenu && <HamburgerMenu position="top-right" hasTopBar={showTopbar} />}
        <Card style={[styles.theCard, cardMarginTop !== undefined ? { marginTop: cardMarginTop } : null]}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={styles.scrollContent}
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
        {isDetailModal && (
          <View style={{ alignItems: 'center' }}>
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
          </View>
        )}
        {isEditModal && canEdit && (
          <View style={{ alignItems: 'center' }}>
            <Button
              mode="contained"
              onPress={onSavePress}
              style={styles.detailButton}
              labelStyle={styles.detailButtonLabel}
              buttonColor="#5124A5"
            >
              Guardar
            </Button>
          </View>
        )}
      </PaperModal>
    </Portal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'white',
    width,
    height,
    justifyContent: 'flex-start',
    // alignItems: 'stretch',
    borderColor: '#5124A5',
  },
  topbar: {
    flexDirection: 'center',
    alignItems: 'center',
    backgroundColor: '#5124A5',
    width: 320,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: 'space-between',
    top: 'auto',
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleWrapper: { // Styles for the title wrapper
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
  theCard: { // Styles for the card
    backgroundColor: '#ffffff',
    width: '95%',
    borderRadius: 50,
    marginVertical: 10,
    maxHeight: height * 0.6,
    overflow: 'hidden',
    marginTop: height * 0.2,
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
  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  topbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    // justifyContent: 'center',
    // alignItems: 'center',
    // paddingVertical: 10,
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  }
});
