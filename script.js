$(document).ready(function () {
    console.log('Script carregado!');

    $('#search-button').click(function () {
        let trackingNumber = $('#tracking-input').val().trim();
        if (trackingNumber === '') {
            alert('Por favor, insira um tracking number!');
            return;
        }

        $.ajax({
            url: 'http://localhost:3000/orders?tracking_number=' + trackingNumber,
            method: 'GET',
            success: function (response) {
                console.log('Resposta da API:', response);
                let dataBody = $('#data-body');
                dataBody.empty();

                if (response.length > 0) {
                    let order = response[0];

                    let row = `<tr>
                        <td>${order.order_number}</td>
                        <td id="print-tracking">${order.tracking_number}</td>
                        <td>${order.sku}</td>
                        <td>€${order.price.toFixed(2)}</td>
                    </tr>`;
                    dataBody.append(row);

                    // Agora armazena o Tracking Number corretamente para impressão
                    $('#print-button').data('tracking', order.tracking_number);
                } else {
                    dataBody.append('<tr><td colspan="4">Nenhum resultado encontrado.</td></tr>');
                }
            },
            error: function (xhr, status, error) {
                console.error('Erro na requisição:', xhr.responseText);
                alert('Erro ao buscar os dados: ' + error);
            }
        });
    });

    $('#reset-button').click(function () {
        $('#tracking-input').val('');
        $('#data-body').empty();
    });

    // Função para imprimir na DYMO LabelWriter 450
    $('#print-button').click(function () {
        let trackingNumber = $(this).data('tracking'); // Pegamos o Tracking Number armazenado

        if (!trackingNumber) {
            alert('Nenhum Tracking Number para imprimir.');
            return;
        }

        try {
            // Verifica se a impressora DYMO está conectada
            let printers = dymo.label.framework.getPrinters();
            if (printers.length === 0) {
                alert('Nenhuma impressora DYMO encontrada.');
                return;
            }

            let printerName = printers[0].name; // Pega a primeira impressora disponível
            console.log('Impressora DYMO encontrada:', printerName);

            // Carregar o modelo da etiqueta a partir da pasta "template"
            $.get('template/label_template.dymo', function (labelXml) {
                console.log("Modelo de etiqueta carregado:", labelXml);

                // Carrega e abre o arquivo do modelo de etiqueta
                let label = dymo.label.framework.openLabelXml(labelXml);

                // Substitui o texto do objeto TrackingNumber com o número de rastreamento
                label.setObjectText("TrackingNumber", trackingNumber);

                // Envia para a impressora DYMO
                label.print(printerName);

                alert(`Etiqueta com Tracking Number "${trackingNumber}" enviada para impressão!`);
            }).fail(function() {
                console.error('Erro ao carregar o modelo de etiqueta.');
                alert('Erro ao carregar o modelo de etiqueta. Verifique o arquivo template/label_template.dymo.');
            });
        } catch (error) {
            console.error('Erro ao imprimir:', error);
            alert('Erro ao imprimir a etiqueta.');
        }
    });
});
