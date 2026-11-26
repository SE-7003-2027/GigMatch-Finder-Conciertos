from fastapi import Request

def obtener_ip_cliente(request: Request) -> str | None:
    """
    IP real del cliente. Detrás de un proxy/balanceador llega en
    X-Forwarded-For (primer valor); si no, se usa la conexión directa.
    Lo movi de location.py para que puedan usarlo location y concerts,
    y asi que concerts no dependa de location.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None