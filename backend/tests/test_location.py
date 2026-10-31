
def test_listar_paises(client):
    response = client.get("api/location/countries")

    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    assert len(data) > 0
    assert "codigo" in data[0]
    assert "nombre" in data[0]

def test_resolver_ubicacion_manual_invalida(client):
    response = client.get("/api/location/resolve?pais=XX")

    assert response.status_code == 404
    assert "no válido" in response.json()["detail"].lower()

def test_listar_ciudades_validas(client):
    """Verifica la carga de ciudades para un país válido (ej. México)."""
    response = client.get("/api/location/countries/MX/cities")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "nombre" in data[0]
    assert "lat" in data[0]

def test_resolver_ubicacion_manual_valida(client):
    """Verifica la resolución exitosa con coordenadas y radio."""
    response = client.get("/api/location/resolve?pais=MX&ciudad=mexico city")
    
    assert response.status_code == 200
    data = response.json()
    assert data["codigoPais"] == "MX"
    assert data["origen"] == "manual"
    assert "radioKm" in data
    assert data["latlong"] is not None