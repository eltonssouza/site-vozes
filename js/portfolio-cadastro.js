/**
 * Portfolio Cadastro JavaScript
 * Funcionalidades para a tela de cadastro de portfólio virtual
 */

$(document).ready(function() {

    // Variáveis globais
    let selectedImages = [];
    const maxImages = 10;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    // Inicialização
    initializeFormValidation();
    initializeImageUpload();
    initializeCEPSearch();
    initializeCharacterCounter();
    initializeFormSubmission();

    /**
     * Inicializa validação do formulário
     */
    function initializeFormValidation() {
        // Validação em tempo real dos campos obrigatórios
        $('.form-control[required], .form-select[required]').on('blur', function() {
            validateField($(this));
        });

        // Validação de URL
        $('input[type="url"]').on('blur', function() {
            validateURL($(this));
        });

        // Validação de email
        $('#email').on('blur', function() {
            validateEmail($(this));
        });

        // Validação de telefone
        $('#phone').on('input', function() {
            formatPhone($(this));
        });

        // Validação de CEP
        $('#cep').on('input', function() {
            formatCEP($(this));
        });

        // Máscara para CEP
        $('#cep').mask('00000-000');

        // Máscara para telefone
        $('#phone').mask('(00) 00000-0000');
    }

    /**
     * Inicializa funcionalidade de upload de imagens
     */
    function initializeImageUpload() {
        const $imageInput = $('#businessImages');
        const $uploadContainer = $('.image-upload-btn');
        const $previewGrid = $('#imagePreviewGrid');
        const $imageCount = $('#imageCount');

        // Click no container de upload
        $uploadContainer.on('click', function(e) {
            e.preventDefault();
            $imageInput.click();
        });

        // Drag and drop
        $uploadContainer.on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over');
        });

        $uploadContainer.on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over');
        });

        $uploadContainer.on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over');

            const files = e.originalEvent.dataTransfer.files;
            handleImageFiles(files);
        });

        // Mudança no input de arquivo
        $imageInput.on('change', function() {
            const files = this.files;
            handleImageFiles(files);
        });

        /**
         * Processa arquivos de imagem selecionados
         */
        function handleImageFiles(files) {
            const filesToAdd = Math.min(files.length, maxImages - selectedImages.length);

            if (selectedImages.length >= maxImages) {
                showMessage('Você já selecionou o máximo de 10 imagens.', 'warning');
                return;
            }

            for (let i = 0; i < filesToAdd; i++) {
                const file = files[i];

                if (!validateImageFile(file)) {
                    continue;
                }

                const imageObj = {
                    file: file,
                    id: generateImageId(),
                    url: URL.createObjectURL(file)
                };

                selectedImages.push(imageObj);
                addImagePreview(imageObj);
            }

            updateImageCounter();

            if (files.length > filesToAdd) {
                showMessage(`Apenas ${filesToAdd} imagens foram adicionadas. Limite máximo: 10 imagens.`, 'info');
            }
        }

        /**
         * Valida arquivo de imagem
         */
        function validateImageFile(file) {
            if (!allowedTypes.includes(file.type)) {
                showMessage(`Formato não suportado: ${file.name}. Use JPG, PNG ou GIF.`, 'error');
                return false;
            }

            if (file.size > maxFileSize) {
                showMessage(`Arquivo muito grande: ${file.name}. Máximo 5MB.`, 'error');
                return false;
            }

            return true;
        }

        /**
         * Adiciona preview da imagem
         */
        function addImagePreview(imageObj) {
            const $previewItem = $(`
                <div class="image-preview-item" data-id="${imageObj.id}">
                    <img src="${imageObj.url}" alt="Preview" loading="lazy">
                    <button type="button" class="image-remove-btn" title="Remover imagem">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `);

            $previewGrid.append($previewItem);

            // Event listener para remover imagem
            $previewItem.find('.image-remove-btn').on('click', function() {
                removeImage(imageObj.id);
            });
        }

        /**
         * Remove imagem selecionada
         */
        function removeImage(imageId) {
            selectedImages = selectedImages.filter(img => img.id !== imageId);
            $(`.image-preview-item[data-id="${imageId}"]`).remove();
            updateImageCounter();

            // Limpa o input para permitir re-seleção do mesmo arquivo
            $imageInput.val('');
        }

        /**
         * Atualiza contador de imagens
         */
        function updateImageCounter() {
            $imageCount.text(selectedImages.length);

            if (selectedImages.length >= maxImages) {
                $uploadContainer.addClass('disabled').css('pointer-events', 'none');
            } else {
                $uploadContainer.removeClass('disabled').css('pointer-events', 'auto');
            }
        }

        /**
         * Gera ID único para imagem
         */
        function generateImageId() {
            return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }

    /**
     * Inicializa busca de endereço por CEP
     */
    function initializeCEPSearch() {
        $('#cep').on('blur', function() {
            const cep = $(this).val().replace(/\D/g, '');

            if (cep.length === 8) {
                searchCEP(cep);
            }
        });

        function searchCEP(cep) {
            const $cepField = $('#cep');
            const $addressField = $('#address');
            const $neighborhoodField = $('#neighborhood');
            const $cityField = $('#city');

            // Mostra loading
            $cepField.addClass('loading');

            $.ajax({
                url: `https://viacep.com.br/ws/${cep}/json/`,
                type: 'GET',
                dataType: 'json',
                timeout: 10000,
                success: function(data) {
                    if (!data.erro) {
                        $addressField.val(data.logradouro);
                        $neighborhoodField.val(data.bairro);
                        $cityField.val(data.localidade);

                        // Foca no campo número
                        $('#number').focus();

                        showMessage('Endereço encontrado com sucesso!', 'success');
                    } else {
                        showMessage('CEP não encontrado.', 'warning');
                    }
                },
                error: function() {
                    showMessage('Erro ao buscar CEP. Verifique sua conexão.', 'error');
                },
                complete: function() {
                    $cepField.removeClass('loading');
                }
            });
        }
    }

    /**
     * Inicializa contador de caracteres
     */
    function initializeCharacterCounter() {
        const $textarea = $('#businessDescription');
        const maxLength = 500;

        $textarea.on('input', function() {
            const currentLength = $(this).val().length;
            const remaining = maxLength - currentLength;

            let $counter = $(this).siblings('.char-counter');
            if ($counter.length === 0) {
                $counter = $('<div class="char-counter form-text"></div>');
                $(this).parent().append($counter);
            }

            $counter.text(`${currentLength}/${maxLength} caracteres`);

            if (remaining < 50) {
                $counter.addClass('text-warning');
            } else {
                $counter.removeClass('text-warning');
            }

            if (remaining < 0) {
                $counter.addClass('text-danger').removeClass('text-warning');
                $(this).addClass('is-invalid');
            } else {
                $counter.removeClass('text-danger');
                $(this).removeClass('is-invalid');
            }
        });
    }

    /**
     * Inicializa submissão do formulário
     */
    function initializeFormSubmission() {
        $('.portfolio-form').on('submit', function(e) {
            e.preventDefault();

            if (validateForm()) {
                submitForm();
            }
        });

        function validateForm() {
            let isValid = true;
            const $form = $('.portfolio-form');

            // Valida campos obrigatórios
            $form.find('[required]').each(function() {
                if (!validateField($(this))) {
                    isValid = false;
                }
            });

            // Valida se pelo menos uma imagem foi selecionada
            if (selectedImages.length === 0) {
                showMessage('Por favor, adicione pelo menos uma imagem do seu negócio.', 'warning');
                $('html, body').animate({
                    scrollTop: $('.image-upload-section').offset().top - 100
                }, 500);
                isValid = false;
            }


            return isValid;
        }

        function submitForm() {
            const $form = $('.portfolio-form');
            const $submitBtn = $('.portfolio-submit-btn');

            // Desabilita botão e mostra loading
            $submitBtn.prop('disabled', true);
            $('body').addClass('loading');

            // Simula envio do formulário
            setTimeout(function() {
                // Aqui você faria a submissão real para o servidor
                showMessage('Portfólio criado com sucesso! Em breve entraremos em contato.', 'success');

                // Opcional: redirecionar para página de confirmação
                // window.location.href = 'portfolio-confirmacao.html';

                $submitBtn.prop('disabled', false);
                $('body').removeClass('loading');
            }, 3000);
        }
    }

    /**
     * Valida campo individual
     */
    function validateField($field) {
        const value = $field.val().trim();
        const fieldType = $field.attr('type');
        const isRequired = $field.prop('required');

        // Remove classes de validação anteriores
        $field.removeClass('is-valid is-invalid');

        if (isRequired && !value) {
            $field.addClass('is-invalid');
            return false;
        }

        if (value) {
            if (fieldType === 'email' && !validateEmail($field)) {
                return false;
            }

            if (fieldType === 'url' && !validateURL($field)) {
                return false;
            }
        }

        if (value || !isRequired) {
            $field.addClass('is-valid');
        }

        return true;
    }

    /**
     * Valida email
     */
    function validateEmail($field) {
        const email = $field.val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            $field.addClass('is-invalid');
            return false;
        }

        return true;
    }

    /**
     * Valida URL
     */
    function validateURL($field) {
        const url = $field.val();

        if (url) {
            try {
                new URL(url);
                $field.addClass('is-valid');
                return true;
            } catch {
                $field.addClass('is-invalid');
                return false;
            }
        }

        return true;
    }

    /**
     * Formata telefone
     */
    function formatPhone($field) {
        let value = $field.val().replace(/\D/g, '');

        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }

        $field.val(value);
    }

    /**
     * Formata CEP
     */
    function formatCEP($field) {
        let value = $field.val().replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
        $field.val(value);
    }

    /**
     * Exibe mensagem para o usuário
     */
    function showMessage(message, type = 'info') {
        // Remove mensagem anterior se existir
        $('.alert-message').remove();

        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };

        const iconClass = {
            'success': 'bi-check-circle',
            'error': 'bi-exclamation-circle',
            'warning': 'bi-exclamation-triangle',
            'info': 'bi-info-circle'
        };

        const $alert = $(`
            <div class="alert ${alertClass[type]} alert-dismissible fade show alert-message" role="alert">
                <i class="bi ${iconClass[type]} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        $('.portfolio-form-container').prepend($alert);

        // Auto remove após 5 segundos (exceto para success)
        if (type !== 'success') {
            setTimeout(function() {
                $alert.fadeOut(500, function() {
                    $(this).remove();
                });
            }, 5000);
        }

        // Scroll para a mensagem
        $('html, body').animate({
            scrollTop: $alert.offset().top - 100
        }, 300);
    }

    /**
     * Adiciona máscara aos campos
     */
    if (typeof $.fn.mask !== 'undefined') {
        $('#cep').mask('00000-000');
        $('#phone').mask('(00) 00000-0000');
    }

});

/**
 * Funções de utilidade global
 */

// Prevenção de envio duplo de formulário
window.addEventListener('beforeunload', function() {
    $('.portfolio-submit-btn').prop('disabled', true);
});

// Validação adicional antes do envio
window.validatePortfolioForm = function() {
    return $('.portfolio-form').find('[required]').filter(function() {
        return !$(this).val().trim();
    }).length === 0;
};