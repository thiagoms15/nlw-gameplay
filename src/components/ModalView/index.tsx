import React, {ReactNode} from 'react';
import { View, TouchableWithoutFeedback, Modal, ModalProps } from 'react-native';

import { Background } from '../Background';
import { styles } from './styles';

export type  GuildProps = {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;

}
type Props = ModalProps & {
    children: ReactNode;
    closeModal: () => void;
}

export function ModalView({ children,
    closeModal,
     ...rest
    }: Props){

    return(
        <Modal
        transparent
        animationType="slide"
        statusBarTranslucent
        {...rest}
        >
            <TouchableWithoutFeedback onPress={closeModal}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <Background>
                            <View style={styles.bar} />
                            {children}
                        </Background>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}