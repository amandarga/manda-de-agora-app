import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { launchCameraAsync, MediaTypeOptions } from "expo-image-picker";

const API_URL = "http://192.168.1.12:5000";

export default function App() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [photo, setPhoto] = useState(null);
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/records`);
      setRecords(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async () => {
    if (!photo) return Alert.alert("Erro", "É necessário tirar uma foto!");

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("idade", idade);
    formData.append("horario", new Date().toISOString());
    formData.append("photo", {
      uri: photo.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      await axios.post(`${API_URL}/records`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNome("");
      setIdade("");
      setPhoto(null);
      fetchRecords();
    } catch (error) {
      console.error("Erro ao adicionar registro:", error);
    }
  };

  const handleTakePhoto = async () => {
    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`${API_URL}/records/${id}`);
      fetchRecords();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Idade"
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
      />
      <Button title="Tirar Foto" onPress={handleTakePhoto} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.photo} />}
      <Button title="Adicionar" onPress={handleAddRecord} />

      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>{item.nome}</Text>
            <Text>{item.idade}</Text>
            <Text>{item.horario}</Text>
            {item.photo && (
              <Image
                source={{ uri: `${API_URL}/${item.photo}` }}
                style={styles.photo}
              />
            )}
            <Button title="Deletar" onPress={() => handleDeleteRecord(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10 },
  photo: { width: 100, height: 100, marginVertical: 10 },
  record: { marginBottom: 20, borderWidth: 1, padding: 10 },
});
