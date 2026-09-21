import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FileImage, X, Camera, FolderOpen } from 'lucide-react-native';
import { useStyles, useTheme } from '../../lib/AppThemeProvider';
import { createAttachment } from '../../services/attachments';
import { generateId } from '../../db/database';

interface ImagePickerFieldProps {
  irRecordId?: string;
  onPicked?: (filePath: string) => void;
}

interface PickedImage {
  uri: string;
  name: string;
  type: string;
  sizeKb: number;
}

export function ImagePickerField({ irRecordId, onPicked }: ImagePickerFieldProps) {
  const { colors } = useTheme();
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);

  const s = useStyles((t) => ({
    row: { flexDirection: 'row' as const, gap: t.spacing.sm },
    btn: {
      flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
      gap: 6, backgroundColor: t.colors.accent, paddingVertical: 12,
      borderRadius: t.radius.button,
    },
    btnText: { color: t.colors.textOnNeon, fontWeight: t.typography.weight.semibold, fontSize: t.typography.size.sm },
    loader: { position: 'absolute' as const, right: 0, top: 16 },
    previewBox: {
      width: 120, height: 120, borderRadius: t.radius.button,
      overflow: 'hidden' as const, backgroundColor: t.colors.surfaceHigh,
      borderWidth: 1, borderColor: t.colors.border, position: 'relative' as const,
    },
    previewImg: { width: '100%' as const, height: '100%' as const },
    removeBtn: {
      position: 'absolute' as const, top: 4, right: 4,
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    fileInfo: {
      position: 'absolute' as const, bottom: 0, left: 0, right: 0,
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4,
      backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 3,
    },
    fileName: { color: '#FFF', fontSize: 9, flex: 1 },
  }));

  const pickFromGallery = async () => {
    setLoading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissao necessaria', 'Permita acesso a galeria nas configuracoes.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        const pi: PickedImage = {
          uri: a.uri,
          name: a.fileName || `img_${Date.now()}.jpg`,
          type: a.mimeType || 'image/jpeg',
          sizeKb: (a.fileSize ?? 0) / 1024,
        };
        setPicked(pi);
        await persist(pi);
      }
    } catch (e) {
      Alert.alert('Erro', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    setLoading(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissao necessaria', 'Permita acesso a camera nas configuracoes.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        const pi: PickedImage = {
          uri: a.uri,
          name: a.fileName || `photo_${Date.now()}.jpg`,
          type: a.mimeType || 'image/jpeg',
          sizeKb: (a.fileSize ?? 0) / 1024,
        };
        setPicked(pi);
        await persist(pi);
      }
    } catch (e) {
      Alert.alert('Erro', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const persist = async (pi: PickedImage) => {
    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 5);
      await createAttachment({
        id: generateId(),
        ir_record_id: irRecordId ?? null,
        bill_id: null,
        file_name: pi.name,
        file_path: pi.uri,
        file_type: pi.type,
        file_size_kb: pi.sizeKb,
        expires_at: expiresAt.toISOString().slice(0, 10),
      });
      onPicked?.(pi.uri);
    } catch (e) {
      console.warn('Falha ao anexar:', (e as Error).message);
    }
  };

  if (picked) {
    return (
      <View style={s.previewBox}>
        <Image source={{ uri: picked.uri }} style={s.previewImg} />
        <Pressable
          onPress={() => setPicked(null)}
          style={s.removeBtn}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Remover imagem"
        >
          <X size={14} color="#FFF" />
        </Pressable>
        <View style={s.fileInfo}>
          <FileImage size={12} color={colors.textMuted} />
          <Text style={s.fileName} numberOfLines={1}>{picked.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.row}>
      <Pressable
        onPress={takePhoto}
        style={s.btn}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Tirar foto"
      >
        <Camera size={16} color={colors.textOnNeon} />
        <Text style={s.btnText}>Camera</Text>
      </Pressable>
      <Pressable
        onPress={pickFromGallery}
        style={s.btn}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Escolher da galeria"
      >
        <FolderOpen size={16} color={colors.textOnNeon} />
        <Text style={s.btnText}>Galeria</Text>
      </Pressable>
      {loading && <ActivityIndicator color={colors.accent} style={s.loader} />}
    </View>
  );
}
