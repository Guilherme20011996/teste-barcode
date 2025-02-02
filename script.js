let trackingData = [];
let visibleData = [];
let columns = [];

// Função para carregar a planilha
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Por favor, selecione um arquivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Pegando a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertendo a planilha para JSON
        trackingData = XLSX.utils.sheet_to_json(sheet);
        visibleData = trackingData;

        // Armazenando os nomes das colunas
        columns = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

        const dataHeader = document.getElementById("data-header");

        columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            dataHeader.appendChild(th);
        });

        console.log("Dados da planilha carregados:", trackingData);
        alert("Planilha carregada com sucesso!");
        loadTable(visibleData);
    };
    reader.readAsArrayBuffer(file);
});


document.addEventListener("DOMContentLoaded", function () {
    // Garantir que o botão de busca esteja funcionando
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
        searchButton.addEventListener("click", searchTracking);
    }
});

function loadTable(data) {
    const tbody = document.getElementById("data-body");

    // Limpar o corpo da tabela
    tbody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement("tr");

        columns.forEach(column => {
            const cell = document.createElement("td");
            cell.innerText = item[column];
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

// Função de busca
function searchTracking() {
    const trackingNumber = document.getElementById("tracking-input").value.trim();

    // Verificar se o campo de rastreamento está vazio
    if (!trackingNumber) {
        alert("Por favor, insira um número de rastreamento.");
        return;
    }

    // Encontrar as linhas da tabela
    let newVisibleData = trackingData.filter(item => item["tracking Number"] === Number(trackingNumber));

    console.table(newVisibleData);

    if (newVisibleData.length === 0) {
        alert("Not found :(");
        return;
    }

    visibleData = newVisibleData;
    loadTable(visibleData);
}

document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
        searchButton.addEventListener("click", searchTracking);
    }
});

function printLabelDymo(orderId, sku, trackingNumber, price) {
    // Verifica se o SDK da Dymo está carregado
    if (typeof dymo === "undefined" || !dymo.label.framework) {
        alert("Erro: SDK da Dymo não carregado. Verifique sua conexão.");
        return;
    }

    // Formato da etiqueta 57mm x 32mm
    const labelXml = `<?xml version="1.0" encoding="utf-8"?>
    <DieCutLabel Version="8.0" Units="mm">
        <PaperOrientation>Landscape</PaperOrientation>
        <Id>Address</Id>
        <IsOutlined>false</IsOutlined>
        <BorderWidth>0</BorderWidth>
        <Objects>
            <!-- Código de barras grande - Order ID -->
            <BarcodeObject>
                <Name>OrderIDBarcode</Name>
                <Value>${orderId}</Value>
                <Type>Code128Auto</Type>
                <Size>Large</Size>
                <TextPosition>Bottom</TextPosition>
                <TextFont Family="Arial" Size="10" Bold="True"/>
                <Bounds X="5" Y="2" Width="50" Height="12"/>
            </BarcodeObject>

            <!-- Tracking Number -->
            <TextObject>
                <Name>TrackingNumber</Name>
                <Text>${trackingNumber}</Text>
                <Font Family="Arial" Size="10" Bold="True"/>
                <Bounds X="10" Y="16" Width="40" Height="6"/>
            </TextObject>

            <!-- SKU -->
            <TextObject>
                <Name>SKU</Name>
                <Text>${sku}</Text>
                <Font Family="Arial" Size="10" Bold="True"/>
                <Bounds X="10" Y="22" Width="40" Height="6"/>
            </TextObject>

            <!-- Código de barras pequeno - Preço -->
            <BarcodeObject>
                <Name>PriceBarcode</Name>
                <Value>${price}</Value>
                <Type>Code128Auto</Type>
                <Size>Small</Size>
                <TextPosition>Bottom</TextPosition>
                <TextFont Family="Arial" Size="8" Bold="True"/>
                <Bounds X="30" Y="22" Width="25" Height="8"/>
            </BarcodeObject>
        </Objects>
    </DieCutLabel>`;

    try {
        // Carrega o modelo da etiqueta
        const label = dymo.label.framework.openLabelXml(labelXml);

        // Obtém a lista de impressoras Dymo conectadas
        const printers = dymo.label.framework.getPrinters();
        if (printers.length === 0) {
            alert("Nenhuma impressora Dymo encontrada.");
            return;
        }

        // Seleciona a primeira impressora Dymo disponível
        const printerName = printers[0].name;

        // Envia a etiqueta para impressão
        label.print(printerName);
        alert("Etiqueta impressa com sucesso!");
    } catch (error) {
        console.error("Erro ao imprimir:", error);
        alert("Erro ao imprimir etiqueta.");
    }
}



